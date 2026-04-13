import { jsx as _jsx } from "react/jsx-runtime";
import { generatePrepaintScript } from '../core/prepaint.js';
export function PrepaintScript({ config, enabled }) {
    const isEnabled = enabled ?? process.env.NEXT_PUBLIC_ENABLE_STYLE_PREVIEW === 'true';
    if (!isEnabled)
        return null;
    const script = generatePrepaintScript(config);
    if (!script)
        return null;
    return (_jsx("script", { dangerouslySetInnerHTML: { __html: script }, suppressHydrationWarning: true }));
}
