// Teaven Email - 模板引擎 (零依赖，兼容 Cloudflare Workers CSP)
// 不使用任何依赖 new Function() 的库，纯字符串替换

// 内置 helper 函数（与之前 Handlebars 注册的 helpers 行为一致）
const builtinHelpers: Record<string, (...args: string[]) => string> = {
  uppercase: (str: string) => (typeof str === 'string' ? str.toUpperCase() : str),
  lowercase: (str: string) => (typeof str === 'string' ? str.toLowerCase() : str),
  date: () => new Date().toISOString(),
  currentYear: () => new Date().getFullYear().toString(),
};

/**
 * 解析模板中的 {{...}} 表达式并替换
 * 支持：
 *   {{varName}}            — 简单变量替换
 *   {{uppercase varName}}  — 调用内置 helper
 *   {{currentYear}}        — 无参 helper
 *
 * 不依赖 eval/new Function，完全兼容 Cloudflare Workers。
 */
function substitute(input: string, variables: Record<string, string>): string {
  // 匹配所有 {{...}} 占位符
  return input.replace(/\{\{(.+?)\}\}/g, (_full: string, inner: string) => {
    const expr = inner.trim();

    // 空表达式 → 原样保留
    if (!expr) return _full;

    // 检查是否是 helper 调用：helperName varName 或 helperName
    const spaceIdx = expr.indexOf(' ');
    if (spaceIdx > 0) {
      const helperName = expr.substring(0, spaceIdx);
      const arg = expr.substring(spaceIdx + 1).trim();
      const helper = builtinHelpers[helperName];
      if (helper) {
        // 如果参数是变量名，从 variables 中取值
        const value = variables[arg] ?? arg;
        return helper(value);
      }
      // 未知 helper，原样保留
      return _full;
    }

    // 无参 helper
    const helper = builtinHelpers[expr];
    if (helper) {
      return helper();
    }

    // 普通变量替换
    if (expr in variables) {
      return variables[expr];
    }

    // 未匹配：保持原样
    return _full;
  });
}

// 模板渲染
export function renderTemplate(
  html: string,
  variables: Record<string, string>,
  options?: { strict?: boolean }
): { html: string; error?: string } {
  try {
    const rendered = substitute(html, variables);
    return { html: rendered };
  } catch (error) {
    return {
      html: '',
      error: `Template render error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// 渲染 subject（也支持变量替换）
export function renderSubject(
  subject: string,
  variables: Record<string, string>
): { subject: string; error?: string } {
  try {
    return { subject: substitute(subject, variables) };
  } catch (error) {
    return {
      subject,
      error: `Subject render error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// 提取模板中的变量名（只匹配 {{varName}}，不匹配 helper 调用）
export function extractVariables(html: string, subject: string): string[] {
  const varRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const variables = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = varRegex.exec(html)) !== null) {
    variables.add(match[1].trim());
  }
  varRegex.lastIndex = 0;
  while ((match = varRegex.exec(subject)) !== null) {
    variables.add(match[1].trim());
  }
  return Array.from(variables);
}

// 验证模板变量
export function validateVariables(
  requiredVars: string[],
  providedVars: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing = requiredVars.filter(v => !(v in providedVars));
  return { valid: missing.length === 0, missing };
}

// HTML 转纯文本（简单实现）
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
