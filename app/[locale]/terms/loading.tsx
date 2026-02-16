import { InfoPageShimmer } from "@/components/ui/shimmer/InfoShimmers";
import { PageContainer } from "@/components/layout/PageContainer";

export default function Loading() {
    return (
        <PageContainer>
            <InfoPageShimmer />
        </PageContainer>
    );
}
