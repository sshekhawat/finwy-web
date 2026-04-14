import { Card, CardContent } from "@/components/ui/card";

export function Subscriptions() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#6C63FF] via-[#5c75ff] to-[#4aa3ff] text-white shadow-lg">
      <CardContent className="p-5">
        <p className="text-xs tracking-[0.2em] text-white/70 uppercase">Credit Card</p>
        <p className="mt-6 text-2xl font-semibold tracking-[0.15em]">****  ****  ****  2048</p>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/70">Card Holder</p>
            <p className="font-medium">VIKRAM KUMAR</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Expiry</p>
            <p className="font-medium">09/30</p>
          </div>
          <div className="relative h-8 w-14">
            <span className="absolute right-0 top-0 size-8 rounded-full bg-white/85" />
            <span className="absolute left-0 top-0 size-8 rounded-full bg-white/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
