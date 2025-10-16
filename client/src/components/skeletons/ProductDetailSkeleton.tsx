import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Skeleton className="h-9 w-44" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="w-full h-[450px] rounded-lg" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-24 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <Card className="flex-grow">
            <CardHeader>
              <CardTitle className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="mt-auto">
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
