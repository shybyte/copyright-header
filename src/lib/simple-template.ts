export function renderSimpleTemplate(
  template: string,
  vars: { readonly [key: string]: string }
): string {
  return template.replace(/\$\w+/g, key => vars[key.slice(1)]);
}
