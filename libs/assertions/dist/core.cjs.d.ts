declare function assertIsDIV(element: Element | unknown): asserts element is HTMLDivElement;
declare function assertIsLI(element: Element | unknown): asserts element is HTMLLIElement;
declare function assertElementType<T extends Element>(element: Element | unknown, type: typeof Element): asserts element is T;
export { assertIsDIV, assertIsLI, assertElementType };
