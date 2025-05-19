import type { ZodType } from "zod";

interface CollectionNames {
  singular: string;
  plural: string;
  path: string;
}

export class Collection {
  id: string;
  idFunction: (prefix: string) => string;
  names: CollectionNames;
  validator: ZodType;

  constructor({
    id,
    idFunction,
    names,
    validator,
  }: {
    id: string;
    idFunction: (prefix: string) => string;
    names: CollectionNames;
    validator: ZodType;
  }) {
    this.id = id;
    this.idFunction = idFunction;
    this.names = names;
    this.validator = validator;
  }
}
