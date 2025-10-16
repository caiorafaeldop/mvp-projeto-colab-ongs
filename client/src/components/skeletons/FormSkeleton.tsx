import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-1/2" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FormSkeleton;
