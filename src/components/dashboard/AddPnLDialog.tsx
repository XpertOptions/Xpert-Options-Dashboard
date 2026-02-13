import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpsertDailyPnL, useDailyPnL } from "@/hooks/usePnLData";
import { toast } from "sonner";
import { NSE_HOLIDAYS, isHoliday, isWeekend } from "@/utils/holidays";

export const AddPnLDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pnl, setPnl] = useState("");
  const [isNoTradeDay, setIsNoTradeDay] = useState(false);
  const { data: dailyPnL } = useDailyPnL();
  const upsertPnL = useUpsertDailyPnL();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const existingEntry = dailyPnL?.find(entry => entry.trade_date === dateStr);

      if (existingEntry) {
        setPnl(existingEntry.pnl.toString());
        setIsNoTradeDay(existingEntry.pnl === 0);
      } else {
        setPnl("");
        // Auto-check No Trade for weekends and holidays
        setIsNoTradeDay(isWeekend(selectedDate) || isHoliday(selectedDate));
      }
    }
  };

  useEffect(() => {
    if (isNoTradeDay) {
      setPnl("0");
    }
  }, [isNoTradeDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const pnlValue = isNoTradeDay ? 0 : parseFloat(pnl);
    if (!isNoTradeDay && isNaN(pnlValue)) {
      toast.error("Please enter a valid P&L value");
      return;
    }

    try {
      await upsertPnL.mutateAsync({
        trade_date: format(date, "yyyy-MM-dd"),
        pnl: pnlValue,
      });
      toast.success("P&L entry saved successfully");
      setOpen(false);
      setPnl("");
      setIsNoTradeDay(false);
      setDate(new Date());
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("An entry for this date already exists");
      } else {
        toast.error("Failed to add entry");
      }
    }
  };

  const holidayName = date ? NSE_HOLIDAYS[format(date, "yyyy-MM-dd")] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Daily P&L
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add/Edit Daily P&L Entry</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your profit or loss for a trading day. Existing entries for the same date will be updated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">Trade Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border",
                    !date && "text-muted-foreground",
                    date && isHoliday(date) && "border-orange-500/50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                  {(holidayName || (date && isWeekend(date))) && (
                    <span className="ml-auto text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">
                      {isWeekend(date!) ? "Weekend" : "Holiday"}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                  modifiers={{
                    holiday: (date) => isHoliday(date),
                    weekend: (date) => isWeekend(date),
                  }}
                  modifiersStyles={{
                    holiday: { color: "#f97316", fontWeight: "bold" },
                    weekend: { color: "#94a3b8" }
                  }}
                />
              </PopoverContent>
            </Popover>
            {holidayName && (
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                NSE Holiday: {holidayName}
              </p>
            )}
            {date && isWeekend(date) && !holidayName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                Market Closed (Weekend)
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border border-border">
            <Checkbox
              id="no-trade"
              checked={isNoTradeDay}
              onCheckedChange={(checked) => setIsNoTradeDay(!!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="no-trade"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer"
              >
                No Trade Day
              </label>
              <p className="text-xs text-muted-foreground">
                Mark this day as a non-trading day (win rate won't be affected)
              </p>
            </div>
          </div>

          <div className={cn("space-y-2", isNoTradeDay && "opacity-50 pointer-events-none")}>
            <Label htmlFor="pnl" className="text-foreground">Daily P&L (₹)</Label>
            <Input
              id="pnl"
              type="number"
              step="0.01"
              placeholder="e.g., 1250 or -500"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              className="font-mono bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isNoTradeDay}
            />
            <p className="text-xs text-muted-foreground">
              Enter positive for profit, negative for loss
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={upsertPnL.isPending}
          >
            {upsertPnL.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};