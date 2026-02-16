import { ContactPageShimmer } from "@/components/ui/shimmer/InfoShimmers";

export default function Loading() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <ContactPageShimmer />
        </div>
    );
}
