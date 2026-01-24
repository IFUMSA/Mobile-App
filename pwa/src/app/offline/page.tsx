export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#1F382E] flex flex-col items-center justify-center px-6">
            <h1 className="font-heading text-[32px] font-bold leading-[40px] text-white text-center mb-4">
                You&apos;re Offline
            </h1>
            <p className="font-body text-[16px] text-white/80 text-center">
                Please check your internet connection and try again.
            </p>
        </div>
    );
}
