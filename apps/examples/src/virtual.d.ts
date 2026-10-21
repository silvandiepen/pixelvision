declare module "virtual:api-reference" {
  import type { ApiReference } from "@build/apiReference.model";

  const reference: ApiReference;
  export default reference;
}

declare module "virtual:package-facts" {
  import type { PackageFacts } from "@build/apiReference.model";

  const facts: PackageFacts;
  export default facts;
}
