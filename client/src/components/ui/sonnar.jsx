import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const Toaster = ({ ...props }) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme="light"
            position="top-right"
            className="toaster"
            toastOptions={{
                classNames: {
                    toast:
                        "group border shadow-lg rounded-lg " +
                        "!bg-[rgb(204,221,255)] !text-black !border-black/10",
                    description: "!text-black/80",
                    actionButton: "!bg-black !text-white",
                    cancelButton: "!bg-white !text-black",
                },
            }}
            icons={{
                success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                error: <XCircle className="w-5 h-5 text-red-600" />,
                warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
                info: <Info className="w-5 h-5 text-blue-600" />,
            }}
            {...props}
        />
    );
};

export { Toaster };
