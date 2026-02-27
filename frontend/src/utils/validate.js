// src/utils/validate.js

function isObject(x) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function pushPathError(errors, path, msg) {
  errors.push(path ? `${path}: ${msg}` : msg);
}

function validateObjectNode(node, errors, path) {
  if (!isObject(node)) return;

  const props = node.properties;
  if (props !== undefined && (!isObject(props) || Array.isArray(props))) {
    pushPathError(errors, path, "properties must be an object when provided.");
  }

  if (node.required !== undefined) {
    if (!Array.isArray(node.required)) {
      pushPathError(errors, path, "required must be an array of strings when provided.");
    } else {
      const propObj = isObject(props) ? props : null;
      for (const r of node.required) {
        if (typeof r !== "string") {
          pushPathError(errors, path, "required must be an array of strings only.");
          break;
        }
        if (propObj && !Object.prototype.hasOwnProperty.call(propObj, r)) {
          pushPathError(errors, path, `required field '${r}' is not defined in properties.`);
        }
      }
    }
  }

  if (isObject(props)) {
    for (const [key, child] of Object.entries(props)) {
      const childPath = path ? `${path}.properties.${key}` : `properties.${key}`;

      if (!isObject(child)) continue;

      if (child.type === "object" || isObject(child.properties)) {
        validateObjectNode(child, errors, childPath);
      }

      if (child.type === "array" && isObject(child.items)) {
        const itemsPath = `${childPath}.items`;
        const items = child.items;

        if (items.type === "object" || isObject(items.properties)) {
          validateObjectNode(items, errors, itemsPath);
        }
      }
    }
  }
}

export function validateSchema(schema) {
  const errors = [];

  if (!isObject(schema)) {
    return { ok: false, errors: ["Schema is missing or not an object."] };
  }

  // Core checks
  if (!schema.title || typeof schema.title !== "string") {
    errors.push("title is required and must be a string.");
  }
  if (!schema.type || typeof schema.type !== "string") {
    errors.push("type is required and must be a string.");
  }

  if (!schema.$schema || typeof schema.$schema !== "string") {
    errors.push("$badges is missing or not a string (badges draft is unknown).");
  }

  if (schema.type === "object" || isObject(schema.properties)) {
    validateObjectNode(schema, errors, "");
  }

  if (schema.type === "array") {
    if (!isObject(schema.items)) {
      errors.push("items is required and must be an object when type is 'array'.");
    } else {
      if (schema.items.type === "object" || isObject(schema.items.properties)) {
        validateObjectNode(schema.items, errors, "items");
      }
    }
  }

  if (isObject(schema.$defs)) {
    for (const [defName, defSchema] of Object.entries(schema.$defs)) {
      if (!isObject(defSchema)) continue;

      const defPath = `$defs.${defName}`;
      if (defSchema.type === "object" || isObject(defSchema.properties)) {
        validateObjectNode(defSchema, errors, defPath);
      }
      if (defSchema.type === "array" && isObject(defSchema.items)) {
        const items = defSchema.items;
        if (items.type === "object" || isObject(items.properties)) {
          validateObjectNode(items, errors, `${defPath}.items`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}