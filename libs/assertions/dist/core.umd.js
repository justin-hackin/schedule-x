(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@schedule-x/assertions"] = {}));
})(this, (function (exports) { 'use strict';

  function assertIsDIV(element) {
      if (!(element instanceof HTMLDivElement)) {
          throw new Error('Element is not a <div>');
      }
  }
  function assertIsLI(element) {
      if (!(element instanceof HTMLLIElement)) {
          throw new Error('Element is not a <li>');
      }
  }
  function assertElementType(element, type) {
      if (!(element instanceof Element)) {
          throw new Error('element is not of type Element');
      }
      if (!(element instanceof type)) {
          throw new Error("element is not of type ".concat(type.name));
      }
  }

  exports.assertElementType = assertElementType;
  exports.assertIsDIV = assertIsDIV;
  exports.assertIsLI = assertIsLI;

}));
