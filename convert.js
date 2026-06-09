const fs = require("fs");
let code = fs.readFileSync(
  "src/app/dashboard/admin/sales/create/page.tsx",
  "utf-8",
);

// 1. Rename component and remove props
code = code.replace(
  /export default function SaleForm\([^)]*\)/,
  "export default function CreateSalePage()",
);

// 2. Remove if (!open) return null;
code = code.replace(/if \(!open\) return null;/, "");

// 3. Add imports
const importsToAdd = `
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
`;
code = code.replace(/import \{ useEffect/, importsToAdd + "import { useEffect");

// 4. Add router
code = code.replace(
  /const \[loading, setLoading\] = useState\(false\);/,
  "const router = useRouter();\n  const [loading, setLoading] = useState(false);",
);

// 5. Change refresh() and onClose()
code = code.replace(/refresh\(\);/g, "");
code = code.replace(/onClose\(\);?/g, 'router.push("/dashboard/admin/sales");');

// 6. Replace return JSX wrapper
const originalReturnRegex =
  /return \(\s*<>\s*<div className="fixed inset-0[^>]*><\/div>\s*<aside className="fixed top-0 right-0[^>]*>\s*\{\/\* Header \*\/\}\s*<div className="flex items-center justify-between p-5 border-b">\s*<h3 className="text-lg font-semibold">New Sale<\/h3>\s*<button onClick=\{[^}]+\}>\s*<X size=\{18\} \/>\s*<\/button>\s*<\/div>\s*\{\/\* Body \*\/\}\s*<div className="p-6 space-y-6 overflow-y-auto h-\[calc\(100%-140px\)\]">/g;

const replacementReturn = `return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Sales History", href: "/dashboard/admin/sales" },
            { label: "New Sale" },
          ]}
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">`;

code = code.replace(originalReturnRegex, replacementReturn);

// 7. Fix footer
const originalFooterRegex =
  /\{\/\* Footer \*\/\}\s*<div className="absolute bottom-0 left-0 right-0 border-t p-4 flex justify-end gap-3 bg-white">/g;
const replacementFooter = `{/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">`;

code = code.replace(originalFooterRegex, replacementFooter);

// 8. Fix the closing tags at the very end
code = code.replace(/<\/aside>\s*<\/>/, "</div>\n    </div>");

// 9. Fix some Absolute path issues like PurchaseItemsSection since it was a relative import in SaleForm.tsx
code = code.replace(
  /from "\.\/SaleItemsSection"/g,
  'from "@/components/sales/SaleItemsSection"',
);
code = code.replace(
  /from "\.\/SalePaymentModal"/g,
  'from "@/components/sales/SalePaymentModal"',
);

fs.writeFileSync("src/app/dashboard/admin/sales/create/page.tsx", code);
