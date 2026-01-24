import { Text } from "@/components/ui/text";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#1F382E]">
            {/* Green Header */}
            <div className="px-6 pt-12 pb-12">
                <Text variant="heading" fontWeight="600" color="textPrimary">
                    Hello!
                </Text>
                <Text variant="subheading" color="textPrimary">
                    Welcome IFUMSAITE!
                </Text>
            </div>

            {/* White content area with rounded top corners */}
            <div className="flex-1 bg-white rounded-t-[60px] min-h-[calc(100vh-160px)] px-6">
                {children}
            </div>
        </div>
    );
}
