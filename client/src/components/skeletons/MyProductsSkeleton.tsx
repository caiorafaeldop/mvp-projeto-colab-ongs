import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MyProductsSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardHeader className="pb-3">
              <CardTitle>
                <Skeleton className="h-6 w-3/4" />
              </CardTitle>
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-7 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyProductsSkeleton;
