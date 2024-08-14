export function escapeXmlText(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function unescapeXmlText(xmlText: string) {
    return xmlText
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
}

export function attributesToString(attributes: Record<string, unknown> | undefined): string {
    if (!attributes) return '';
    const entries = Object.entries(attributes).filter(([_, value]) => value !== undefined);
    if (entries.length === 0) return '';
    return ` ${entries.map(([key, value]) => `${key}="${escapeXmlText(`${value}`)}"`).join(' ')}`;
}
