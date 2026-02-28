// src/utils/schemaNormalize.js

function str(x) {
  if (x === null || x === undefined) return "";
  return String(x);
}

/**
 * Returns a compact draft label based on the $schema URI.
 * Examples: "2020-12", "2019-09", "draft-07", "draft-06", or "unknown".
 */
function schemaDraftLabel(schemaUri) {
  const s = str(schemaUri).trim();
  if (!s) return "unknown";

  const lower = s.toLowerCase();

  if (lower.includes("draft/2020-12")) return "2020-12";
  if (lower.includes("draft/2019-09")) return "2019-09";
  if (lower.includes("draft-07")) return "draft-07";
  if (lower.includes("draft-06")) return "draft-06";
  if (lower.includes("draft-05")) return "draft-05";
  if (lower.includes("draft-04")) return "draft-04";

  // Fallback for any other URIs
  const m = lower.match(/draft\/(\d{4}-\d{2})/);
  if (m && m[1]) return m[1];

  return "unknown";
}

function inferType(node, rootSchema = null) {
  if (!node || typeof node !== "object") return "unknown";

  if (node.$ref && rootSchema) {
    const resolved = resolveRef(rootSchema, node.$ref);
    if (resolved) return inferType(resolved, rootSchema);
  }

  if (typeof node.type === "string") return node.type;
  if (Array.isArray(node.type)) return node.type.join("|");
  if (node.properties) return "object";
  if (node.items) return "array";
  if (node.enum) return "enum";
  if (node.const !== undefined) return "const";
  if (node.anyOf) return "anyOf";
  if (node.oneOf) return "oneOf";
  if (node.allOf) return "allOf";
  return "unknown";
}

function refNameFromRef(ref) {
  if (!ref || typeof ref !== "string") return null;
  if (!ref.startsWith("#/$defs/")) return null;
  return ref.replace("#/$defs/", "") || null;
}

function resolveRef(rootSchema, ref) {
  if (!ref || typeof ref !== "string") return null;
  if (!ref.startsWith("#/$defs/")) return null;

  const key = ref.replace("#/$defs/", "");
  const defs =
    rootSchema?.$defs && typeof rootSchema.$defs === "object" ? rootSchema.$defs : null;
  if (!defs) return null;

  return defs[key] || null;
}

function typeLabel(node, rootSchema = null) {
  const t = inferType(node, rootSchema);

  if (t === "array") {
    const items = node?.items;

    const refName = items?.$ref ? refNameFromRef(items.$ref) : null;
    if (refName) return `List of '${refName}' pre-defined objects`;

    const itType = items ? inferType(items, rootSchema) : "unknown";
    if (itType === "string") return "List of strings (text)";
    if (itType === "integer") return "List of integers (whole numbers)";
    if (itType === "number") return "List of numbers";
    if (itType === "object") return "List of grouped items";
    return `List of ${itType}s`;
  }

  if (t === "integer") return "Integer (whole number only)";
  if (t === "number") return "Number (allows decimal)";
  if (t === "string") return "Text";
  if (t === "boolean") return "Yes or No";
  if (t === "object") return "Grouped properties (contains sub-fields)";
  if (t === "enum") return "Choice list";
  return t;
}

function previewKind(node, rootSchema = null) {
  const t = inferType(node, rootSchema);
  if (t === "string") return "text";
  if (t === "integer" || t === "number") return "number";
  if (t === "boolean") return "boolean";
  if (node?.enum) return "select";
  if (t === "array") return "repeatable";
  return "unknown";
}

function explainPattern(pat) {
  if (!pat) return null;
  const p = String(pat);

  if (p === "\\d{5}" || p === "^\\d{5}$") return "Must be exactly 5 digits.";
  if (p === "\\d{9}" || p === "^\\d{9}$") return "Must be exactly 9 digits.";
  if (p === "^\\d{5}-\\d{4}$") return "Must be a ZIP+4 code (e.g., 12345-6789).";
  if (p === "^[A-Z]{2}$") return "Must be exactly 2 uppercase letters.";
  if (p === "^[A-Za-z]+$") return "Letters only.";
  if (p === "^\\d+$") return "Digits only.";
  if (p === "^[A-Za-z0-9]+$") return "Letters and numbers only.";

  return null;
}

function explainFormat(fmt) {
  const f = String(fmt || "").toLowerCase();
  if (!f) return null;

  if (f === "email") return "Must be a valid email address.";
  if (f === "date") return "Must be a valid date.";
  if (f === "date-time") return "Must be a valid date and time.";
  if (f === "uri" || f === "url") return "Must be a valid URL.";

  return null;
}

function getArrayItemObjectSchema(rootSchema, node) {
  if (!node || typeof node !== "object") return null;
  const items = node.items && typeof node.items === "object" ? node.items : null;
  if (!items) return null;

  if (items.type === "object" && items.properties) return items;

  if (items.$ref) {
    const resolved = resolveRef(rootSchema, items.$ref);
    if (resolved && inferType(resolved, rootSchema) === "object") return resolved;
  }

  return null;
}

function plainRules(node) {
  const parts = [];
  if (!node || typeof node !== "object") return "";

  if (node.format !== undefined) {
    const fmt = explainFormat(node.format);
    if (fmt) parts.push(fmt);
  }

  if (node.minimum !== undefined) parts.push(`Minimum value is ${node.minimum}.`);
  if (node.maximum !== undefined) parts.push(`Maximum value is ${node.maximum}.`);

  if (node.minLength !== undefined) parts.push(`Minimum length is ${node.minLength} characters.`);
  if (node.maxLength !== undefined) parts.push(`Maximum length is ${node.maxLength} characters.`);

  if (node.pattern !== undefined) {
    const expl = explainPattern(node.pattern);
    if (expl) parts.push(expl);
    else parts.push(`Must match pattern: ${node.pattern}.`);
  }

  if (Array.isArray(node.enum)) parts.push(`Must be one of ${node.enum.length} allowed values.`);
  if (node.const !== undefined) parts.push(`Value is always ${JSON.stringify(node.const)}.`);

  if (inferType(node) === "array") {
    const it = node.items || {};

    if (it.format !== undefined) {
      const fmt = explainFormat(it.format);
      if (fmt) parts.push(`Each item: ${fmt.replace(/\.$/, "")}.`);
    }

    if (it.enum) parts.push(`Each item must be one of ${it.enum.length} values.`);

    if (it.pattern !== undefined) {
      const expl = explainPattern(it.pattern);
      if (expl) parts.push(`Each item: ${expl.replace(/\.$/, "")}.`);
      else parts.push(`Each item must match pattern: ${it.pattern}.`);
    }

    if (it.minLength !== undefined) parts.push(`Each item minimum length is ${it.minLength}.`);
    if (it.maxLength !== undefined) parts.push(`Each item maximum length is ${it.maxLength}.`);
  }

  return parts.join(" ");
}

function normalizeObjectSchema(rootSchema, objSchema, name = null, depth = 1) {
  const requiredSet = new Set(Array.isArray(objSchema?.required) ? objSchema.required : []);
  const props =
    objSchema?.properties && typeof objSchema.properties === "object" ? objSchema.properties : {};

  const fields = Object.keys(props).map((fieldName) => {
    const node = props[fieldName] || {};
    const kind = inferType(node, rootSchema);

    let nestedFields = null;

    if (depth > 0 && kind === "object" && node.properties && typeof node.properties === "object") {
      const nestedNorm = normalizeObjectSchema(rootSchema, node, fieldName, depth - 1);
      nestedFields = nestedNorm.fields;
    }

    if (depth > 0 && kind === "array") {
      const itemObj = getArrayItemObjectSchema(rootSchema, node);
      if (itemObj) {
        const nestedNorm = normalizeObjectSchema(rootSchema, itemObj, fieldName, depth - 1);
        nestedFields = nestedNorm.fields;
      }
    }

    return {
      name: fieldName,
      typeKind: kind,
      typeLabel: typeLabel(node, rootSchema),
      required: requiredSet.has(fieldName),
      description: str(node.description),
      rulesPlain: plainRules(node),
      previewKind: previewKind(node, rootSchema),
      enumValues: Array.isArray(node.enum) ? node.enum : null,
      nestedFields,
    };
  });

  return { name, typeKind: "object", typeLabel: "Group", fields };
}

function summarizePropertyRules(props, requiredSet = new Set()) {
  const out = [];

  for (const [name, rule] of Object.entries(props)) {
    const parts = [];

    if (requiredSet.has(name)) {
      parts.push("is required");
    }

    if (rule.minLength !== undefined && rule.maxLength !== undefined) {
      if (rule.minLength === rule.maxLength) {
        parts.push(`must be exactly ${rule.minLength} characters`);
      } else {
        parts.push(`must be between ${rule.minLength} and ${rule.maxLength} characters`);
      }
    }

    if (parts.length === 0) continue;

    out.push(`${name} ${parts.join(" and ")}`);
  }

  return out;
}

function summarizeConditional(schema) {
  if (!schema || typeof schema !== "object") return [];
  if (!schema.if || typeof schema.if !== "object") return [];

  const ifProps = schema.if?.properties || {};
  const condParts = [];

  for (const [k, v] of Object.entries(ifProps)) {
    if (v && typeof v === "object" && "const" in v) {
      condParts.push(`${k} is ${JSON.stringify(v.const)}`);
    }
  }

  const when = condParts.length ? condParts.join(" and ") : "a condition is met";

  const thenProps = schema.then?.properties || {};
  const thenRequired = new Set(schema.then?.required || []);

  const elseRequired = new Set(schema.else?.required || []);

  const thenSummary = summarizePropertyRules(thenProps, thenRequired);
  const elseSummary = [];

  for (const name of Object.keys(thenProps)) {
    if (!elseRequired.has(name)) {
      elseSummary.push(`${name} is optional`);
    }
  }

  return [
    {
      when,
      then: thenSummary,
      else: elseSummary,
    },
  ];
}

export function normalizeSchema(schema) {
  const title = str(schema?.title) || "(untitled)";
  const description = str(schema?.description);
  const id = str(schema?.$id);

  const schemaUri = str(schema?.$schema);
  const schemaDraft = schemaDraftLabel(schemaUri);

  const rootType = inferType(schema, schema);
  const root =
    rootType === "object"
      ? normalizeObjectSchema(schema, schema, null, 2)
      : { name: null, typeKind: rootType, typeLabel: typeLabel(schema, schema), fields: [] };

  const defs = [];
  const defsObj = schema?.$defs && typeof schema.$defs === "object" ? schema.$defs : null;
  if (defsObj) {
    for (const defName of Object.keys(defsObj)) {
      const defSchema = defsObj[defName];
      const defType = inferType(defSchema, schema);
      if (defType === "object") defs.push(normalizeObjectSchema(schema, defSchema, defName, 2));
      else
        defs.push({
          name: defName,
          typeKind: defType,
          typeLabel: typeLabel(defSchema, schema),
          fields: [],
        });
    }
  }

  const conditionals = summarizeConditional(schema);

  return {
    meta: { id, schemaUri, schemaDraft },
    title,
    description,
    typeKind: rootType,
    typeLabel: typeLabel(schema, schema),
    root,
    defs,
    conditionals,
  };
}