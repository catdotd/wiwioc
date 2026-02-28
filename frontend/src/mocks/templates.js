// src/mocks/templates.js

export const templates = [
  {
    id: 1,
    name: "Personal Information Template",
    baseline: {
      $id: "https://example.com/personal-info.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Personal Information",
      type: "object",
      properties: {
        firstName: { type: "string", description: "The person's first name." },
        lastName: { type: "string", description: "The person's last name." },
        age: {
          description: "Age in years which must be equal to or greater than zero.",
          type: "integer",
          minimum: 0,
        },
        maritalStatus: {
          description: "Marital Status of the individual.",
          type: "string",
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zipCode: { type: "string", pattern: "^\\d{5}$" },
          },
          required: ["street", "city", "state", "zipCode"],
        },
        hobbies: { type: "array", items: { type: "string" } },
      },
      required: ["firstName", "lastName", "age"],
    },
    draft: {
      $id: "https://example.com/personal-info.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Personal Information",
      type: "object",
      properties: {
        firstName: { type: "string", description: "The person's first name." },
        lastName: { type: "string", description: "The person's last name." },
        middleName: { type: "string", description: "The person's middle name." },
        age: {
          description: "Age in years which must be equal to or greater than one.",
          type: "integer",
          minimum: 1,
        },
        email: { type: "string", format: "email" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zipCode: { type: "string", pattern: "^\\d{5}$" },
            country: { type: "string" },
          },
          required: ["street", "city", "state", "zipCode"],
        },
        hobbies: { type: "array", items: { type: "string" } },
      },
      required: ["firstName", "lastName", "age", "email"],
    },
  },

  {
    id: 2,
    name: "Vegetables Template",
    baseline: {
      $id: "https://example.com/arrays.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      description: "Arrays of strings and objects",
      title: "Arrays",
      type: "object",
      properties: {
        fruits: { type: "array", items: { type: "string" } },
        vegetables: { type: "array", items: { $ref: "#/$defs/veggie" } },
      },
      $defs: {
        veggie: {
          type: "object",
          required: ["veggieName"],
          properties: {
            veggieName: { type: "string", description: "The name of the vegetable." },
            veggieLike: { type: "boolean", description: "Do I like this vegetable?" },
          },
        },
      },
    },
    draft: {
      $id: "https://example.com/arrays.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      description: "Arrays of strings and objects",
      title: "Arrays",
      type: "object",
      properties: {
        fruits: { type: "array", items: { type: "string" } },
        vegetables: { type: "array", items: { $ref: "#/$defs/veggie" } },
        grains: {
          type: "array",
          items: { type: "string" },
          description: "Common grains.",
        },
      },
      $defs: {
        veggie: {
          type: "object",
          required: ["veggieName", "veggieLike", "veggieColor"],
          properties: {
            veggieName: { type: "string", description: "The name of the vegetable." },
            veggieLike: { type: "boolean", description: "Do I like this vegetable?" },
            veggieColor: { type: "string", description: "The color of the vegetable." },
          },
        },
      },
    },
  },

  {
    id: 3,
    name: "Membership Details Template",
    baseline: {
      $id: "https://example.com/conditional-validation-if-else.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Conditional Validation with If-Else",
      type: "object",
      properties: {
        isMember: { type: "boolean" },
        membershipNumber: { type: "string" },
      },
      required: ["isMember"],
      if: { properties: { isMember: { const: true } } },
      then: {
        properties: {
          membershipNumber: { type: "string", minLength: 10, maxLength: 10 },
        },
      },
      else: {
        properties: {
          membershipNumber: { type: "string", minLength: 15 },
        },
      },
    },
    draft: {
      $id: "https://example.com/conditional-validation-if-else.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Conditional Validation with If-Else",
      type: "object",
      properties: {
        isMember: { type: "boolean" },
        membershipNumber: { type: "string" },
      },
      required: ["isMember"],
      if: { properties: { isMember: { const: true } } },
      then: {
        properties: {
          membershipNumber: { type: "string", minLength: 12, maxLength: 12 },
        },
        required: ["membershipNumber"],
      },
      else: {
        properties: {
          membershipNumber: { type: "string", minLength: 12, maxLength: 12 },
        },
      },
    },
  },

  {
    id: 4,
    name: "Checkout Payment Template",
    baseline: {
      $id: "https://example.com/payment.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Payment",
      type: "object",
      properties: {
        amount: { type: "number", minimum: 0 },
        currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
        note: { type: "string", description: "Optional free text." },
      },
      required: ["amount", "currency"],
    },
    draft: {
      $id: "https://example.com/payment.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Payment",
      type: "object",
      properties: {
        amount: { type: "integer", minimum: 0 },
        currency: { type: "string", enum: ["USD", "EUR"] },
        note: { type: "string", description: "Optional free text." },
        paymentMethod: { type: "string", enum: ["card", "ach"] },
      },
      required: ["amount", "currency", "paymentMethod"],
    },
  },

  {
    id: 5,
    name: "Support Ticket Template",
    baseline: {
      $id: "https://example.com/ticket.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Ticket",
      type: "object",
      properties: {
        id: { type: "string", minLength: 8, maxLength: 8 },
        email: { type: "string", format: "email" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        description: { type: "string", minLength: 20 },
      },
      required: ["id", "email", "priority"],
    },
    draft: {
      $id: "https://example.com/ticket.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Ticket",
      type: "object",
      properties: {
        id: { type: "string", minLength: 8, maxLength: 10 },
        email: { type: "string", format: "email" },
        // breaking: priority removed
        description: { type: "string", minLength: 20 },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["id", "email"],
    },
  },

  {
    id: 6,
    name: "Shipping Address Template",
    baseline: {
      $id: "https://example.com/shipping.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "ShippingAddress",
      type: "object",
      properties: {
        postalCode: { type: "string", pattern: "^\\d{5}$" },
        countryCode: { type: "string", pattern: "^[A-Z]{2}$" },
      },
      required: ["postalCode", "countryCode"],
    },
    draft: {
      $id: "https://example.com/shipping.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "ShippingAddress",
      type: "object",
      properties: {
        postalCode: { type: "string", pattern: "^\\d{5}-\\d{4}$" },
        countryCode: { type: "string", pattern: "^[A-Z]{2}$" },
        region: { type: "string" },
      },
      required: ["postalCode", "countryCode"],
    },
  },

  {
    id: 7,
    name: "Medical Vitals Template",
    baseline: {
      $id: "https://example.com/vitals.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Vitals",
      type: "object",
      properties: {
        heartRate: { type: "integer", minimum: 0 },
        temperatureC: { type: "number", minimum: 30, maximum: 45 },
        deviceId: { type: "string" },
      },
      required: ["heartRate", "temperatureC", "deviceId"],
    },
    draft: {
      $id: "https://example.com/vitals.schema.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Vitals",
      type: "object",
      properties: {
        heartRate: { type: "integer", minimum: 30 },
        temperatureC: { type: "number", minimum: 35, maximum: 42 },
        deviceId: { type: "string" },
      },
      required: ["heartRate", "temperatureC"],
    },
  },
];