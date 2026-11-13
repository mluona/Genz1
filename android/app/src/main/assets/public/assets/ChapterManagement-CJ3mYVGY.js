import { c as createLucideIcon, Q as useSearchParams, r as reactExports, y as supabase, w as jsxRuntimeExports, x as motion, A as AnimatePresence, X, I as Lock, a0 as LoaderCircle, F as ArrowUp, G as Search } from "./index-BNptM8td.js";
import { F as FileArchive, U as Upload, E as ExternalLink, J as JSZip, s as splitAndCompressImage } from "./jszip.min-Dm3A7SKb.js";
import { u as uploadToLocal } from "./localUpload-DN0fFoi0.js";
import { c as clsx } from "./clsx-DgYk2OaC.js";
import { g as getProxiedImageUrl } from "./imageUtils-CO4tJ9Ml.js";
import { L as Layers } from "./layers-DLmq4yKN.js";
import { P as Plus } from "./plus-BsfOAGru.js";
import { C as Coins } from "./coins-Dzew_KuE.js";
import { C as Check } from "./check-CALsGMvw.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
import { A as ArrowDown } from "./arrow-down-8kruHUpR.js";
import { P as Pen } from "./pen-mIybmmv0.js";
import { I as Image } from "./image-Db96004O.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$4);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
  ],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 4v16", key: "1654pz" }],
  ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2", key: "e0r10z" }],
  ["path", { d: "M9 20h6", key: "s66wpe" }]
];
const Type = createLucideIcon("type", __iconNode);
const concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
const createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
const createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
const CLASS_PART_SEPARATOR = "-";
const EMPTY_CONFLICTS = [];
const ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
const createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
const getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
const createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
const processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
const processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
const processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
const processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
const processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
const getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
const isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
const createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = "!";
const MODIFIER_SEPARATOR = ":";
const EMPTY_MODIFIERS = [];
const createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
const createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
const createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
const twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
const fallbackThemeArr = [];
const fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = (value) => fractionRegex.test(value);
const isNumber = (value) => !!value && !Number.isNaN(Number(value));
const isInteger = (value) => !!value && Number.isInteger(Number(value));
const isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
const isTshirtSize = (value) => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
const isLabelPosition = (label) => label === "position" || label === "percentage";
const isLabelImage = (label) => label === "image" || label === "url";
const isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
const isLabelLength = (label) => label === "length";
const isLabelNumber = (label) => label === "number";
const isLabelFamilyName = (label) => label === "family-name";
const isLabelWeight = (label) => label === "number" || label === "weight";
const isLabelShadow = (label) => label === "shadow";
const getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ChapterManagement = () => {
  var _a;
  const [searchParams] = useSearchParams();
  const [seriesList, setSeriesList] = reactExports.useState([]);
  const [selectedSeries, setSelectedSeries] = reactExports.useState(null);
  const [chapters, setChapters] = reactExports.useState([]);
  const [isEditorOpen, setIsEditorOpen] = reactExports.useState(false);
  const [editingChapter, setEditingChapter] = reactExports.useState(null);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [formData, setFormData] = reactExports.useState({
    chapterNumber: 1,
    title: "",
    content: [],
    publishDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA"),
    isPremium: false,
    coinPrice: 0
  });
  const [uploadProgress, setUploadProgress] = reactExports.useState({});
  const [failedUploads, setFailedUploads] = reactExports.useState([]);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [totalFilesToUpload, setTotalFilesToUpload] = reactExports.useState(0);
  const [completedFilesCount, setCompletedFilesCount] = reactExports.useState(0);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [savingProgress, setSavingProgress] = reactExports.useState({ current: 0, total: 0, status: "" });
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [isExtracting, setIsExtracting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [selectedChapters, setSelectedChapters] = reactExports.useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = reactExports.useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = reactExports.useState(false);
  const [bulkUpdateData, setBulkUpdateData] = reactExports.useState({ isPremium: false, coinPrice: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = reactExports.useState(false);
  const [chapterToDelete, setChapterToDelete] = reactExports.useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = reactExports.useState(false);
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = reactExports.useState(false);
  const [isSmartImporting, setIsSmartImporting] = reactExports.useState(false);
  const [smartImportLog, setSmartImportLog] = reactExports.useState([]);
  const fileInputRef = reactExports.useRef(null);
  const zipInputRef = reactExports.useRef(null);
  const smartZipInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const fetchSeries = async () => {
      const { data, error: error2 } = await supabase.from("series").select("*").order("title", { ascending: true });
      if (error2) {
        console.error("Error fetching series:", error2);
        return;
      }
      const list = data || [];
      setSeriesList(list);
      const seriesId = searchParams.get("seriesId");
      if (seriesId) {
        const found = list.find((s) => s.id === seriesId);
        if (found) setSelectedSeries(found);
      }
    };
    fetchSeries();
    const channel = supabase.channel("series_changes").on("postgres_changes", { event: "*", schema: "public", table: "series" }, () => {
      fetchSeries();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchParams]);
  const fetchChapters = async () => {
    if (!selectedSeries) {
      setChapters([]);
      return;
    }
    const { data, error: error2 } = await supabase.from("chapters").select("*").eq("seriesId", selectedSeries.id).order("chapterNumber", { ascending: false });
    if (error2) {
      console.error("Error fetching chapters:", error2);
      return;
    }
    setChapters(data || []);
  };
  reactExports.useEffect(() => {
    if (!selectedSeries) {
      setChapters([]);
      return;
    }
    fetchChapters();
    const channel = supabase.channel(`chapters_${selectedSeries.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "chapters",
      filter: `seriesId=eq.${selectedSeries.id}`
    }, () => {
      fetchChapters();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSeries]);
  const toggleChapterSelection = (id) => {
    setSelectedChapters(
      (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const toggleAllSelection = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters.map((c) => c.id));
    }
  };
  const handleBulkDelete = async () => {
    if (selectedChapters.length === 0) return;
    try {
      const { error: error2 } = await supabase.from("chapters").delete().in("id", selectedChapters);
      if (error2) throw error2;
      await supabase.from("pages").delete().in("chapterId", selectedChapters);
      setSuccess(`Successfully deleted ${selectedChapters.length} chapters.`);
      setSelectedChapters([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      setError(`Bulk delete failed: ${err.message}`);
    }
  };
  const handleBulkUpdate = async () => {
    if (selectedChapters.length === 0) return;
    try {
      const { error: error2 } = await supabase.from("chapters").update({
        isPremium: bulkUpdateData.isPremium,
        coinPrice: bulkUpdateData.coinPrice
      }).in("id", selectedChapters);
      if (error2) throw error2;
      setSuccess(`Successfully updated ${selectedChapters.length} chapters.`);
      setSelectedChapters([]);
      setIsBulkUpdateModalOpen(false);
    } catch (err) {
      setError(`Bulk update failed: ${err.message}`);
    }
  };
  const uploadFiles = async (files) => {
    if (!selectedSeries) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress({});
    setFailedUploads([]);
    setTotalFilesToUpload(files.length);
    setCompletedFilesCount(0);
    const startIndex = formData.content.length;
    const placeholders = files.map((f) => `uploading-${f.name}-${Date.now()}`);
    setFormData((prev) => ({ ...prev, content: [...prev.content, ...placeholders] }));
    const CONCURRENCY_LIMIT = 6;
    const tasks = files.map((file, i) => ({ file, fileId: placeholders[i], i }));
    const runTask = async (task) => {
      const { file, fileId, i } = task;
      try {
        console.log(`Starting compression for: ${file.name}`, {
          size: (file.size / 1024).toFixed(2) + " KB",
          type: file.type
        });
        const base64Images = await splitAndCompressImage(file, 0.9);
        console.log(`Successfully compressed and split into ${base64Images.length} parts: ${file.name}`);
        setFormData((prev) => {
          const newContent = [...prev.content];
          const placeholderIndex = newContent.indexOf(fileId);
          if (placeholderIndex !== -1) {
            newContent.splice(placeholderIndex, 1, ...base64Images);
          }
          return { ...prev, content: newContent };
        });
        setCompletedFilesCount((prev) => prev + 1);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
      } catch (err) {
        console.error(`Compression error for ${file.name}:`, err);
        setFailedUploads((prev) => [...prev, {
          name: file.name,
          error: err.message || "Unknown error",
          index: startIndex + i
        }]);
        setFormData((prev) => ({
          ...prev,
          content: prev.content.filter((item) => item !== fileId)
        }));
      }
    };
    for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
      const chunk = tasks.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map(runTask));
    }
    setIsUploading(false);
    setTotalFilesToUpload(0);
    setCompletedFilesCount(0);
  };
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" }));
    uploadFiles(files);
  };
  const handleZipUpload = async (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file || !selectedSeries) return;
    setIsExtracting(true);
    setError(null);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const imageFiles = Object.keys(contents.files).filter((name) => !contents.files[name].dir && /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)$/i.test(name)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
      if (imageFiles.length === 0) {
        setError("No images found in ZIP.");
        setIsExtracting(false);
        return;
      }
      const files = [];
      for (const name of imageFiles) {
        const blob = await contents.files[name].async("blob");
        files.push(new File([blob], name.split("/").pop() || name, { type: blob.type }));
      }
      setIsExtracting(false);
      await uploadFiles(files);
    } catch (err) {
      setError(`ZIP Error: ${err.message}`);
      setIsExtracting(false);
    }
  };
  const handleSmartZipUpload = async (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    setIsSmartImportModalOpen(true);
    setIsSmartImporting(true);
    setSmartImportLog([`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Starting Smart Import from ${file.name}...`]);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const docxFiles = Object.keys(contents.files).filter((name) => !contents.files[name].dir && /\.docx$/i.test(name)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
      if (docxFiles.length > 0) {
        setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Found ${docxFiles.length} DOCX chapters. Starting Novel import...`]);
        if (!selectedSeries) {
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ERROR: Please select a series first to import novel chapters!`]);
          setIsSmartImporting(false);
          return;
        }
        const parseDocxText = async (arrayBuffer) => {
          const docxZip = new JSZip();
          const docxContents = await docxZip.loadAsync(arrayBuffer);
          const docFile = docxContents.file("word/document.xml");
          if (!docFile) return "";
          const xmlText = await docFile.async("string");
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          const paragraphs = xmlDoc.getElementsByTagName("w:p");
          const lines = [];
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const textNodes = p.getElementsByTagName("w:t");
            let pText = "";
            for (let j = 0; j < textNodes.length; j++) {
              pText += textNodes[j].textContent || "";
            }
            lines.push(pText);
          }
          return lines.join("\n");
        };
        for (const name of docxFiles) {
          const filename = name.split("/").pop() || name;
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Parsing ${filename}...`]);
          const numMatch = filename.match(/(?:chapter|ch|chap|ep|episode|فصل)\s*(\d+(\.\d+)?)/i) || filename.match(/^(\d+(\.\d+)?)/);
          let chapterNumber = 1;
          if (numMatch) {
            chapterNumber = parseFloat(numMatch[1]);
          } else {
            const anyNumMatch = filename.match(/(\d+(\.\d+)?)/);
            if (anyNumMatch) {
              chapterNumber = parseFloat(anyNumMatch[1]);
            }
          }
          let chapterTitle = filename.replace(/\.docx$/i, "").trim();
          chapterTitle = chapterTitle.replace(/^(?:chapter|ch|chap|ep|episode|فصل)?\s*\d+(\.\d+)?\s*[-_:\s]*/i, "").trim();
          if (!chapterTitle) {
            chapterTitle = `الفصل ${chapterNumber}`;
          }
          try {
            const buffer = await contents.files[name].async("arraybuffer");
            const parsedText = await parseDocxText(buffer);
            const wordCount = parsedText.split(/\s+/).filter(Boolean).length || 0;
            const { data: chaptersData, error: chaptersError } = await supabase.from("chapters").select("*").eq("seriesId", selectedSeries.id).eq("chapterNumber", chapterNumber);
            if (chaptersError) {
              setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Error checking chapter ${chapterNumber}: ${chaptersError.message}`]);
              continue;
            }
            if (chaptersData && chaptersData.length > 0) {
              setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Updating existing Chapter ${chapterNumber}: ${chapterTitle}`]);
              const { error: updateError } = await supabase.from("chapters").update({
                title: chapterTitle,
                content: [parsedText],
                pageCount: wordCount
              }).eq("id", chaptersData[0].id);
              if (updateError) throw updateError;
            } else {
              setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Creating new Chapter ${chapterNumber}: ${chapterTitle}`]);
              const { error: insertError } = await supabase.from("chapters").insert({
                seriesId: selectedSeries.id,
                chapterNumber,
                title: chapterTitle,
                content: [parsedText],
                publishDate: (/* @__PURE__ */ new Date()).toISOString(),
                views: 0,
                pageCount: wordCount,
                isPremium: false,
                coinPrice: 0
              });
              if (insertError) throw insertError;
            }
            await supabase.from("series").update({ lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", selectedSeries.id);
          } catch (err) {
            setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Error importing ${filename}: ${err.message}`]);
          }
        }
        setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Smart Import completed successfully!`]);
        setIsSmartImporting(false);
        if (smartZipInputRef.current) smartZipInputRef.current.value = "";
        fetchChapters();
        return;
      }
      const imageFiles = Object.keys(contents.files).filter((name) => !contents.files[name].dir && /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)$/i.test(name)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
      if (imageFiles.length === 0) {
        setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Error: No images or DOCX found in ZIP.`]);
        setIsSmartImporting(false);
        return;
      }
      setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Found ${imageFiles.length} images. Parsing structure...`]);
      const structure = {};
      for (const path of imageFiles) {
        const parts = path.split("/").filter(Boolean);
        const filename = parts.pop();
        let seriesName = "Unknown Series";
        let chapterStr = "1";
        if (parts.length === 0) {
          if (selectedSeries) seriesName = selectedSeries.title;
        } else if (parts.length === 1) {
          const match = parts[0].match(/(?:chapter|ch|chap|ep|episode)\s*(\d+(\.\d+)?)/i) || parts[0].match(/^(\d+(\.\d+)?)$/);
          if (match) {
            if (selectedSeries) seriesName = selectedSeries.title;
            chapterStr = match[1];
          } else {
            seriesName = parts[0];
          }
        } else {
          seriesName = parts[0];
          const chapDir = parts[1];
          const match = chapDir.match(/(?:chapter|ch|chap|ep|episode)\s*(\d+(\.\d+)?)/i) || chapDir.match(/^(\d+(\.\d+)?)$/);
          if (match) {
            chapterStr = match[1];
          } else {
            chapterStr = chapDir;
          }
        }
        if (!structure[seriesName]) structure[seriesName] = {};
        if (!structure[seriesName][chapterStr]) structure[seriesName][chapterStr] = [];
        structure[seriesName][chapterStr].push(path);
      }
      for (const [seriesName, chaptersObj] of Object.entries(structure)) {
        setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Processing series: ${seriesName}`]);
        let seriesId = "";
        const existingSeries = seriesList.find((s) => s.title.toLowerCase() === seriesName.toLowerCase());
        if (existingSeries) {
          seriesId = existingSeries.id;
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Found existing series: ${seriesName}`]);
        } else {
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Creating new series: ${seriesName}`]);
          const slug = seriesName.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "") || `series-${Date.now()}`;
          const { data: newSeries, error: seriesError } = await supabase.from("series").insert({
            title: seriesName,
            description: "",
            coverImage: "",
            type: "Manga",
            status: "Ongoing",
            genres: [],
            tags: [],
            views: 0,
            rating: 5,
            ratingCount: 1,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
            slug,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }).select().single();
          if (seriesError || !newSeries) {
            console.error("Error creating series:", seriesError);
            continue;
          }
          seriesId = newSeries.id;
        }
        for (const [chapterStr, paths] of Object.entries(chaptersObj)) {
          const chapterNumber = parseFloat(chapterStr) || 1;
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Processing Chapter ${chapterNumber} (${paths.length} pages)...`]);
          const { data: chaptersData, error: chaptersError } = await supabase.from("chapters").select("*").eq("seriesId", seriesId).eq("chapterNumber", chapterNumber);
          if (chaptersError) {
            console.error("Error checking chapters:", chaptersError);
            continue;
          }
          const existingChapter = chaptersData && chaptersData.length > 0 ? chaptersData[0] : null;
          let chapterId = "";
          if (existingChapter) {
            chapterId = existingChapter.id;
            setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Updating existing Chapter ${chapterNumber}`]);
          } else {
            const { data: newChapter, error: chapterError } = await supabase.from("chapters").insert({
              seriesId,
              chapterNumber,
              title: `Chapter ${chapterNumber}`,
              content: [],
              publishDate: (/* @__PURE__ */ new Date()).toISOString(),
              views: 0,
              pageCount: paths.length
            }).select().single();
            if (chapterError || !newChapter) {
              console.error("Error creating chapter:", chapterError);
              continue;
            }
            chapterId = newChapter.id;
          }
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Compressing and uploading pages...`]);
          let useLocalUpload = true;
          if (useLocalUpload) {
            const uploadedUrls = [];
            let pageIndex = 0;
            const processImage = async (path, index) => {
              const blob = await contents.files[path].async("blob");
              const file2 = new File([blob], path.split("/").pop(), { type: blob.type });
              try {
                setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Processing ${file2.name}...`]);
                const base64Images = await splitAndCompressImage(file2, 0.9);
                const sliceUrls = await Promise.all(base64Images.map(async (base64, sliceIndex) => {
                  const filename = `${seriesId}/${chapterId}/page_${index}_slice_${sliceIndex}_${Date.now()}.jpg`;
                  return await uploadToLocal(base64, filename);
                }));
                return { index, urls: sliceUrls };
              } catch (err) {
                setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Error processing ${file2.name}: ${err.message}`]);
                throw err;
              }
            };
            try {
              const CONCURRENCY_LIMIT = 6;
              const results = [];
              for (let i = 0; i < paths.length; i += CONCURRENCY_LIMIT) {
                const chunk = paths.slice(i, i + CONCURRENCY_LIMIT);
                const chunkResults = await Promise.all(chunk.map((path, j) => processImage(path, i + j)));
                results.push(...chunkResults);
              }
              results.sort((a, b) => a.index - b.index);
              const allUrls = results.flatMap((r) => r.urls);
              await supabase.from("chapters").update({
                content: allUrls,
                pageCount: allUrls.length
              }).eq("id", chapterId);
              await supabase.from("pages").delete().eq("chapterId", chapterId);
            } catch (err) {
              setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Local upload failed, falling back to database: ${err.message}`]);
              useLocalUpload = false;
            }
          }
          if (!useLocalUpload) {
            if (existingChapter) {
              await supabase.from("pages").delete().eq("chapterId", chapterId);
            }
            let pageIndex = 0;
            const pagesToInsert = [];
            for (const path of paths) {
              const blob = await contents.files[path].async("blob");
              const file2 = new File([blob], path.split("/").pop(), { type: blob.type });
              try {
                const base64Images = await splitAndCompressImage(file2, 0.9);
                for (const base64 of base64Images) {
                  pagesToInsert.push({
                    chapterId,
                    pageNumber: pageIndex,
                    content: base64
                  });
                  pageIndex++;
                }
              } catch (err) {
                setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Error compressing ${file2.name}: ${err.message}`]);
              }
            }
            if (pagesToInsert.length > 0) {
              const BATCH_SIZE = 100;
              for (let i = 0; i < pagesToInsert.length; i += BATCH_SIZE) {
                const chunk = pagesToInsert.slice(i, i + BATCH_SIZE);
                await supabase.from("pages").insert(chunk);
              }
            }
            await supabase.from("chapters").update({ pageCount: pageIndex }).eq("id", chapterId);
          }
          setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Chapter ${chapterNumber} completed.`]);
        }
        await supabase.from("series").update({ lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", seriesId);
      }
      setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Smart Import completed successfully!`]);
    } catch (err) {
      setSmartImportLog((prev) => [...prev, `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] CRITICAL ERROR: ${err.message}`]);
    } finally {
      setIsSmartImporting(false);
      if (smartZipInputRef.current) smartZipInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e, shouldContinue = false) => {
    var _a2;
    if (e) e.preventDefault();
    if (!selectedSeries) return;
    setIsSaving(true);
    setError(null);
    const localTodayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
    let publishDate;
    if (formData.publishDate === localTodayStr) {
      publishDate = /* @__PURE__ */ new Date();
    } else {
      const now = /* @__PURE__ */ new Date();
      const [year, month, day] = formData.publishDate.split("-").map(Number);
      publishDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }
    const isNovel = selectedSeries.type === "Novel";
    const chapterData = {
      chapterNumber: parseFloat(formData.chapterNumber.toString()),
      title: formData.title,
      seriesId: selectedSeries.id,
      publishDate: publishDate.toISOString(),
      views: (editingChapter == null ? void 0 : editingChapter.views) || 0,
      content: isNovel ? formData.content : [],
      // Store empty array for non-novels in the main doc
      pageCount: isNovel ? ((_a2 = formData.content[0]) == null ? void 0 : _a2.split(/\s+/).filter(Boolean).length) || 0 : formData.content.length,
      isPremium: formData.isPremium,
      coinPrice: formData.coinPrice
    };
    try {
      let chapterId = editingChapter == null ? void 0 : editingChapter.id;
      if (editingChapter) {
        const { error: updateError } = await supabase.from("chapters").update(chapterData).eq("id", editingChapter.id);
        if (updateError) throw updateError;
      } else {
        const { data: newChapter, error: insertError } = await supabase.from("chapters").insert(chapterData).select().single();
        if (insertError || !newChapter) throw insertError || new Error("Failed to create chapter");
        chapterId = newChapter.id;
        await supabase.from("series").update({ lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", selectedSeries.id);
      }
      if (chapterId && !isNovel) {
        let useLocalUpload = true;
        let finalContent = [...formData.content];
        if (useLocalUpload) {
          setSavingProgress({ current: 0, total: formData.content.length, status: "Initializing..." });
          const uploadedUrls = new Array(formData.content.length);
          const imagesToPresign = formData.content.map((content, i) => ({ content, i })).filter((item) => item.content.startsWith("data:image"));
          setSavingProgress((prev) => ({ ...prev, status: "Uploading pages directly to cloud..." }));
          const CONCURRENCY_LIMIT = 15;
          const uploadTasks = formData.content.map((content, i) => ({ content, i }));
          const runUploadTask = async (task) => {
            var _a3;
            const { content, i } = task;
            if (content.startsWith("data:image")) {
              try {
                const mimeType = ((_a3 = content.match(/data:(.*?);/)) == null ? void 0 : _a3[1]) || "image/jpeg";
                const fileExt = mimeType.split("/")[1] || "jpg";
                const filename = `${selectedSeries.id}/${chapterId}/page_${i}_${Date.now()}.${fileExt}`;
                const url = await uploadToLocal(content, filename, mimeType);
                uploadedUrls[i] = url;
              } catch (err) {
                console.error(`Failed to upload page ${i} locally:`, err);
                throw err;
              }
            } else {
              uploadedUrls[i] = content;
            }
            setSavingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          };
          try {
            for (let i = 0; i < uploadTasks.length; i += CONCURRENCY_LIMIT) {
              const chunk = uploadTasks.slice(i, i + CONCURRENCY_LIMIT);
              await Promise.all(chunk.map(runUploadTask));
            }
            finalContent = uploadedUrls.filter(Boolean);
            await supabase.from("chapters").update({ content: finalContent }).eq("id", chapterId);
            await supabase.from("pages").delete().eq("chapterId", chapterId);
          } catch (err) {
            console.error("Local parallel upload failed, falling back to database:", err);
            useLocalUpload = false;
          }
        }
        if (!useLocalUpload) {
          await supabase.from("pages").delete().eq("chapterId", chapterId);
          const pagesToInsert = [];
          for (let i = 0; i < formData.content.length; i++) {
            pagesToInsert.push({
              chapterId,
              pageNumber: i,
              content: formData.content[i]
            });
          }
          if (pagesToInsert.length > 0) {
            const BATCH_SIZE = 100;
            for (let i = 0; i < pagesToInsert.length; i += BATCH_SIZE) {
              const chunk = pagesToInsert.slice(i, i + BATCH_SIZE);
              await supabase.from("pages").insert(chunk);
            }
          }
        }
      }
      if (editingChapter) {
        setSuccess("Chapter updated successfully!");
      } else {
        setSuccess("Chapter created successfully!");
      }
      if (shouldContinue) {
        const nextNum = chapterData.chapterNumber + 1;
        setFormData({
          chapterNumber: nextNum,
          title: "",
          content: [],
          publishDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA"),
          isPremium: false,
          coinPrice: 0
        });
        setEditingChapter(null);
      } else {
        setIsEditorOpen(false);
        setEditingChapter(null);
        resetForm();
      }
    } catch (err) {
      let errorMessage = err.message;
      if (errorMessage === "Failed to fetch" || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Network Error: Could not connect to the database. Please ensure your Supabase URL & API Keys are correctly configured in AI Studio Secrets, and that you have an internet connection.";
      }
      setError(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 3e3);
    }
  };
  const resetForm = () => {
    setFormData({
      chapterNumber: chapters.length > 0 ? chapters[0].chapterNumber + 1 : 1,
      title: "",
      content: [],
      publishDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA"),
      isPremium: false,
      coinPrice: 0
    });
    setUploadProgress({});
    setFailedUploads([]);
    setSavingProgress({ current: 0, total: 0, status: "" });
  };
  const handleDelete = (id) => {
    if (!selectedSeries) return;
    setChapterToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedSeries || !chapterToDelete) return;
    try {
      if (selectedSeries.type !== "Novel") {
        await supabase.from("pages").delete().eq("chapterId", chapterToDelete);
      }
      const { error: error2 } = await supabase.from("chapters").delete().eq("id", chapterToDelete);
      if (error2) throw error2;
      setSuccess("Chapter deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleteModalOpen(false);
      setChapterToDelete(null);
      setTimeout(() => setSuccess(null), 3e3);
    }
  };
  const openEditor = async (chapter) => {
    if (chapter) {
      let content = chapter.content || [];
      if ((selectedSeries == null ? void 0 : selectedSeries.type) !== "Novel") {
        const { data: pagesData, error: error2 } = await supabase.from("pages").select("content").eq("chapterId", chapter.id).order("pageNumber", { ascending: true });
        if (error2) {
          console.error("Error fetching pages:", error2);
        } else if (pagesData && pagesData.length > 0) {
          content = pagesData.map((p) => p.content);
        }
      }
      setEditingChapter(chapter);
      setFormData({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title || "",
        content,
        publishDate: new Date(chapter.publishDate).toLocaleDateString("en-CA"),
        isPremium: chapter.isPremium || false,
        coinPrice: chapter.coinPrice || 0
      });
    } else {
      setEditingChapter(null);
      resetForm();
    }
    setIsEditorOpen(true);
  };
  const filteredChapters = chapters.filter(
    (c) => {
      var _a2;
      return ((_a2 = c.title) == null ? void 0 : _a2.toLowerCase().includes(searchTerm.toLowerCase())) || c.chapterNumber.toString().includes(searchTerm);
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#F8F9FA] text-[#1A1A1A]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" }),
            "Chapter Management"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-widest", children: "Admin Control Panel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block h-8 w-px bg-zinc-200 mx-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden sm:inline", children: "Active Series" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none w-full sm:min-w-[240px]",
              value: (selectedSeries == null ? void 0 : selectedSeries.id) || "",
              onChange: (e) => setSelectedSeries(seriesList.find((s) => s.id === e.target.value) || null),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a series..." }),
                seriesList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.title }, s.id))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto", children: [
        !isEditorOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            onClick: () => {
              var _a2;
              return (_a2 = smartZipInputRef.current) == null ? void 0 : _a2.click();
            },
            className: "w-full sm:w-auto justify-center bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className: "w-4 h-4" }),
              " ",
              (selectedSeries == null ? void 0 : selectedSeries.type) === "Novel" ? "استيراد فصول دفعة واحدة (ZIP/.docx)" : "Smart Bulk Import"
            ]
          }
        ),
        selectedSeries && !isEditorOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            onClick: () => openEditor(),
            className: "w-full sm:w-auto justify-center bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              " New Chapter"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".zip", className: "hidden", ref: smartZipInputRef, onChange: handleSmartZipUpload }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-[1600px] mx-auto p-4 sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: !selectedSeries ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "flex flex-col items-center justify-center py-16 sm:py-32 text-center px-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-8 h-8 sm:w-10 sm:h-10 text-zinc-300" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black text-zinc-400", children: "No Series Selected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 mt-2 max-w-md", children: "Please select a series from the dropdown above to start managing its chapters." })
        ]
      },
      "empty"
    ) : isEditorOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        className: "grid grid-cols-1 lg:grid-cols-12 gap-8",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-4 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6 sm:space-y-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg sm:text-xl font-black uppercase tracking-tight", children: "Chapter Details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setIsEditorOpen(false),
                    className: "p-2 hover:bg-zinc-100 rounded-full transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest", children: "Chapter Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      step: "0.1",
                      value: formData.chapterNumber,
                      onChange: (e) => setFormData((prev) => ({ ...prev, chapterNumber: Number(e.target.value) })),
                      className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest", children: "Title (Optional)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: formData.title,
                      onChange: (e) => setFormData((prev) => ({ ...prev, title: e.target.value })),
                      placeholder: "e.g. The Beginning of the End",
                      className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest", children: "Publish Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: formData.publishDate,
                      onChange: (e) => setFormData((prev) => ({ ...prev, publishDate: e.target.value })),
                      className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-zinc-100", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-6 rounded-full p-1 transition-colors ${formData.isPremium ? "bg-amber-500" : "bg-zinc-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded-full bg-white transition-transform ${formData.isPremium ? "translate-x-4" : "translate-x-0"}` }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-amber-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-zinc-700", children: "Premium Chapter" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        className: "hidden",
                        checked: formData.isPremium,
                        onChange: (e) => setFormData((prev) => ({ ...prev, isPremium: e.target.checked }))
                      }
                    )
                  ] }),
                  formData.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 animate-in fade-in slide-in-from-top-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-3 h-3" }),
                      " Coin Price"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        min: "0",
                        value: formData.coinPrice,
                        onChange: (e) => setFormData((prev) => ({ ...prev, coinPrice: Number(e.target.value) })),
                        className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-zinc-100 flex flex-col gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => handleSubmit(e, false),
                    disabled: isSaving || isUploading,
                    className: "w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                    children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Saving..." })
                      ] }),
                      savingProgress.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold text-zinc-400", children: [
                        "Uploading to Cloud: ",
                        savingProgress.current,
                        " / ",
                        savingProgress.total
                      ] })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                      " ",
                      editingChapter ? "Update Chapter" : "Save & Close"
                    ] })
                  }
                ),
                !editingChapter && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => handleSubmit(e, true),
                    disabled: isSaving || isUploading,
                    className: "w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                    children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: savingProgress.status || "Saving..." })
                      ] }),
                      savingProgress.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold text-emerald-900/50", children: [
                        savingProgress.current,
                        " / ",
                        savingProgress.total
                      ] })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                      " Save & Continue"
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setIsEditorOpen(false),
                    className: "w-full bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all",
                    children: "Cancel"
                  }
                )
              ] })
            ] }),
            (isUploading || isExtracting || error || success || failedUploads.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                className: cn(
                  "p-6 rounded-[2rem] border shadow-sm",
                  error || failedUploads.length > 0 ? "bg-red-50 border-red-100 text-red-600" : success ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      error || failedUploads.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" }) : success ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black uppercase tracking-tight", children: error || failedUploads.length > 0 ? "Upload Issues" : success ? "Success" : "Processing..." })
                    ] }),
                    failedUploads.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => setFailedUploads([]),
                        className: "text-[10px] font-black uppercase tracking-widest hover:underline",
                        children: "Clear"
                      }
                    )
                  ] }),
                  error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium leading-relaxed mb-2", children: error }),
                  success && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium leading-relaxed", children: success }),
                  failedUploads.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar", children: failedUploads.map((fail, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-white/50 rounded-xl border border-red-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-tight truncate", children: fail.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-medium opacity-80 mt-1", children: fail.error })
                  ] }, i)) }),
                  isUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-widest opacity-70", children: "Overall Progress" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-black", children: [
                        completedFilesCount,
                        " / ",
                        totalFilesToUpload
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-blue-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "h-full bg-blue-600 transition-all duration-500",
                        style: { width: `${completedFilesCount / totalFilesToUpload * 100}%` }
                      }
                    ) })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "lg:col-span-8 space-y-6 relative",
              onDragOver: (e) => {
                e.preventDefault();
                setIsDragging(true);
              },
              onDragLeave: () => setIsDragging(false),
              onDrop: (e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                const zipFile = files.find((f) => f.name.endsWith(".zip"));
                if (zipFile) {
                  const mockEvent = { target: { files: [zipFile] } };
                  handleZipUpload(mockEvent);
                } else {
                  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
                  if (imageFiles.length > 0) uploadFiles(imageFiles);
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isDragging && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                    className: "absolute inset-0 z-50 bg-emerald-500/10 backdrop-blur-sm border-4 border-dashed border-emerald-500 rounded-[2rem] flex items-center justify-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-12 h-12 text-emerald-500 animate-bounce" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-black uppercase tracking-tight", children: "Drop to Upload" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-zinc-500", children: "Images or ZIP files supported" })
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm min-h-[400px] sm:min-h-[600px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg sm:text-xl font-black uppercase tracking-tight", children: selectedSeries.type === "Novel" ? "Chapter Content" : "Chapter Pages" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-zinc-500 mt-1", children: selectedSeries.type === "Novel" ? "Write or paste your chapter text below." : "Upload images or ZIP files to add pages." })
                    ] }),
                    selectedSeries.type !== "Novel" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => {
                            const newContent = [...formData.content].sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
                            setFormData((prev) => ({ ...prev, content: newContent }));
                          },
                          className: "p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500",
                          title: "Sort Pages",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setIsClearModalOpen(true),
                          className: "p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400",
                          title: "Clear All",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" })
                        }
                      )
                    ] })
                  ] }),
                  selectedSeries.type === "Novel" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "textarea",
                      {
                        value: formData.content[0] || "",
                        onChange: (e) => setFormData((prev) => ({ ...prev, content: [e.target.value] })),
                        placeholder: "Once upon a time...",
                        className: "w-full min-h-[500px] bg-zinc-50 border border-zinc-200 rounded-3xl p-8 text-lg font-serif leading-relaxed outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center px-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-widest", children: [
                        "Word Count: ",
                        ((_a = formData.content[0]) == null ? void 0 : _a.split(/\s+/).filter(Boolean).length) || 0
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-zinc-400", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Rich Text Supported" })
                      ] })
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "text",
                            placeholder: "Add image URL directly... (e.g. https://imgur.com/...)",
                            id: "manual-url-input",
                            className: "flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none",
                            onKeyDown: (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = e.target.value;
                                if (val) {
                                  setFormData((prev) => ({ ...prev, content: [...prev.content, val] }));
                                  e.target.value = "";
                                }
                              }
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            className: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-6 rounded-2xl transition-colors",
                            onClick: (e) => {
                              e.preventDefault();
                              const input = document.getElementById("manual-url-input");
                              const val = input == null ? void 0 : input.value;
                              if (val) {
                                setFormData((prev) => ({ ...prev, content: [...prev.content, val] }));
                                input.value = "";
                              }
                            },
                            children: "Add URL"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            onClick: () => {
                              var _a2;
                              return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                            },
                            className: "group relative border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-6 h-6" }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-tight", children: "Upload Images" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest", children: "JPG, PNG, WEBP, etc." })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", multiple: true, accept: "image/*", className: "hidden", ref: fileInputRef, onChange: handleFileUpload })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            onClick: () => {
                              var _a2;
                              return (_a2 = zipInputRef.current) == null ? void 0 : _a2.click();
                            },
                            className: "group relative border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className: "w-6 h-6" }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-tight", children: "Upload ZIP" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest", children: "Auto-extract images" })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".zip", className: "hidden", ref: zipInputRef, onChange: handleZipUpload })
                            ]
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4", children: formData.content.map((url, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      motion.div,
                      {
                        layout: true,
                        className: "group relative aspect-[3/4] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all",
                        children: [
                          url && !url.startsWith("uploading-") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getProxiedImageUrl(url), className: "w-full h-full object-cover", alt: `Page ${index + 1}`, referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-50", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 text-blue-400 animate-spin" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black text-blue-400 uppercase tracking-widest", children: "Uploading..." })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  onClick: () => {
                                    const newContent = [...formData.content];
                                    const target = index - 1;
                                    if (target >= 0) {
                                      [newContent[index], newContent[target]] = [newContent[target], newContent[index]];
                                      setFormData((prev) => ({ ...prev, content: newContent }));
                                    }
                                  },
                                  className: "p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors",
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-4 h-4" })
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  onClick: () => {
                                    const newContent = [...formData.content];
                                    const target = index + 1;
                                    if (target < newContent.length) {
                                      [newContent[index], newContent[target]] = [newContent[target], newContent[index]];
                                      setFormData((prev) => ({ ...prev, content: newContent }));
                                    }
                                  },
                                  className: "p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors",
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-4 h-4" })
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                onClick: () => {
                                  setFormData((prev) => ({ ...prev, content: prev.content.filter((_, i) => i !== index) }));
                                },
                                className: "px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors",
                                children: "Remove"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest", children: [
                            "Page ",
                            index + 1
                          ] })
                        ]
                      },
                      `${url}-${index}`
                    )) })
                  ] })
                ] })
              ]
            }
          )
        ]
      },
      "editor"
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "space-y-8",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black tracking-tight", children: selectedSeries.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-zinc-500 font-medium mt-1", children: [
                "Manage ",
                chapters.length,
                " chapters for this series."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto", children: [
              selectedChapters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl w-full sm:w-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black text-emerald-700 px-2 uppercase tracking-widest", children: [
                  selectedChapters.length,
                  " Selected"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setIsBulkUpdateModalOpen(true),
                    className: "flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3" }),
                      " Update"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setIsBulkDeleteModalOpen(true),
                    className: "flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }),
                      " Delete"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: toggleAllSelection,
                    className: "flex items-center gap-2 px-4 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                    children: [
                      selectedChapters.length === chapters.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-4 h-4" }),
                      selectedChapters.length === chapters.length ? "Deselect" : "Select All"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      placeholder: "Search chapters...",
                      value: searchTerm,
                      onChange: (e) => setSearchTerm(e.target.value),
                      className: "bg-white border border-zinc-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 w-full md:w-80"
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: [
            filteredChapters.map((chapter) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  layout: true,
                  className: cn(
                    "group bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all relative",
                    selectedChapters.includes(chapter.id) ? "border-emerald-500 shadow-xl ring-2 ring-emerald-500/20" : "border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: selectedChapters.includes(chapter.id),
                        onChange: () => toggleChapterSelection(chapter.id),
                        className: "w-5 h-5 rounded-lg border-zinc-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4 sm:mb-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-12 h-12 sm:w-14 sm:h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors ml-8", children: [
                        "#",
                        chapter.chapterNumber
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditor(chapter);
                            },
                            className: "p-2 hover:bg-blue-50 text-zinc-400 hover:text-blue-500 rounded-xl transition-all relative z-10",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(chapter.id);
                            },
                            className: "p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all relative z-10",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-lg truncate", children: chapter.title || `Chapter ${chapter.chapterNumber}` }),
                          chapter.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full shrink-0", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3" }),
                            " ",
                            chapter.coinPrice
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1", children: [
                          "Published ",
                          new Date(chapter.publishDate).toLocaleDateString()
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-zinc-100", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-3 h-3 text-zinc-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black text-zinc-500 uppercase tracking-widest", children: [
                            chapter.pageCount ?? ((_a2 = chapter.content) == null ? void 0 : _a2.length) ?? 0,
                            " ",
                            selectedSeries.type === "Novel" ? "Words" : "Pages"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3 text-zinc-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black text-zinc-500 uppercase tracking-widest", children: [
                            chapter.views.toLocaleString(),
                            " Views"
                          ] })
                        ] })
                      ] })
                    ] })
                  ]
                },
                chapter.id
              );
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => openEditor(),
                className: "group aspect-square border-4 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-zinc-300 hover:text-emerald-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-8 h-8" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black uppercase tracking-widest", children: "Add Chapter" })
                ]
              }
            )
          ] })
        ]
      },
      "list"
    ) }) }),
    isBulkDeleteModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-8 h-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-black uppercase tracking-tight", children: [
          "Delete ",
          selectedChapters.length,
          " Chapters?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "This action cannot be undone. All pages and data associated with these chapters will be lost." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsBulkDeleteModalOpen(false),
            className: "flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleBulkDelete,
            className: "flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors",
            children: "Delete All"
          }
        )
      ] })
    ] }) }),
    isBulkUpdateModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-black uppercase tracking-tight", children: [
          "Bulk Update ",
          selectedChapters.length,
          " Chapters"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "Update premium settings for selected chapters." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-zinc-50 rounded-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold", children: "Premium Chapter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-zinc-500 font-bold uppercase tracking-widest", children: "Requires coins to unlock" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setBulkUpdateData((prev) => ({ ...prev, isPremium: !prev.isPremium })),
              className: cn(
                "w-12 h-6 rounded-full transition-colors relative",
                bulkUpdateData.isPremium ? "bg-amber-500" : "bg-zinc-300"
              ),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                bulkUpdateData.isPremium ? "left-7" : "left-1"
              ) })
            }
          )
        ] }),
        bulkUpdateData.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Coin Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: bulkUpdateData.coinPrice,
                onChange: (e) => setBulkUpdateData((prev) => ({ ...prev, coinPrice: parseInt(e.target.value) || 0 })),
                className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-500/20 outline-none"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsBulkUpdateModalOpen(false),
            className: "flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleBulkUpdate,
            className: "flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors",
            children: "Update All"
          }
        )
      ] })
    ] }) }),
    isDeleteModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-8 h-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black uppercase tracking-tight", children: "Delete Chapter?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "This action cannot be undone. The chapter and all its pages will be permanently deleted." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsDeleteModalOpen(false),
            className: "flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: confirmDelete,
            className: "flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors",
            children: "Delete"
          }
        )
      ] })
    ] }) }),
    isClearModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-8 h-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black uppercase tracking-tight", children: "Clear All Pages?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "Are you sure you want to remove all pages from this chapter? You will need to re-upload them." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsClearModalOpen(false),
            className: "flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setFormData((prev) => ({ ...prev, content: [] }));
              setIsClearModalOpen(false);
            },
            className: "flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors",
            children: "Clear All"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isSmartImportModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        className: "bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-white/10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-500/20 text-blue-400 rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className: "w-6 h-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black uppercase tracking-tight text-white", children: "Smart Bulk Import" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 text-sm font-medium", children: "Automatically identifying series and chapters from ZIP" })
              ] })
            ] }),
            !isSmartImporting && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setIsSmartImportModalOpen(false),
                className: "p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/50 rounded-2xl p-4 border border-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-black uppercase tracking-tight text-sm", children: "Import Console" }),
              isSmartImporting && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 font-mono text-xs h-64 overflow-y-auto custom-scrollbar", children: [
              smartImportLog.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-600", children: [
                  "[",
                  log.split("] ")[0].replace("[", ""),
                  "]"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: log.includes("completed successfully") || log.includes("Found") ? "text-emerald-400" : log.includes("Error") || log.includes("ERROR") ? "text-red-400" : "text-zinc-300", children: log.split("] ")[1] })
              ] }, i)),
              smartImportLog.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-600 italic", children: "Waiting for import task..." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-4 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setIsSmartImportModalOpen(false),
              disabled: isSmartImporting,
              className: "px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50",
              children: isSmartImporting ? "Close (Runs in background)" : "Close"
            }
          ) })
        ]
      }
    ) }) })
  ] });
};
export {
  ChapterManagement
};
