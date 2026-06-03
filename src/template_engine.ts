// Teaven Email - 模板引擎 (Handlebars)
import Handlebars from 'handlebars';

// 注册内置 helpers
Handlebars.registerHelper('uppercase', (str: string) => {
  return typeof str === 'string' ? str.toUpperCase() : str;
});

Handlebars.registerHelper('lowercase', (str: string) => {
  return typeof str === 'string' ? str.toLowerCase() : str;
});

Handlebars.registerHelper('date', (format: string) => {
  return new Date().toISOString();
});

Handlebars.registerHelper('currentYear', () => {
  return new Date().getFullYear().toString();
});

// 模板渲染
export function renderTemplate(
  html: string,
  variables: Record<string, string>,
  options?: { strict?: boolean }
): { html: string; error?: string } {
  try {
    const template = Handlebars.compile(html, {
      noEscape: true,
      strict: options?.strict ?? false,
    });
    const rendered = template(variables);
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
    const template = Handlebars.compile(subject, { noEscape: true });
    return { subject: template(variables) };
  } catch (error) {
    return {
      subject,
      error: `Subject render error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// 提取模板中的变量名
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
