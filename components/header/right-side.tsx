"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useViewStore } from "@/lib/store";
import CarIcon from "@/public/car-icon.svg";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CarsFilters from "../sidebar/cars-filter";

export default function HeaderRight({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { selectedView, setView } = useViewStore();

  const handleStreamView = (v: string) => {
    setView(v);
    setOpen(false);
  };

  return (
    <div className="flex items-center space-x-4 pr-2">
      {/* <SearchComponent /> */}
      <Select value={selectedView} onValueChange={(v) => handleStreamView(v)}>
        <SelectTrigger className="sm:w-24 select-none w-18 p-1 sm:p-2 border-border text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="dark:border-border bg-muted">
          <SelectItem
            value="month"
            className="hover:bg-black hover:text-black cursor-pointer"
          >
            Month
          </SelectItem>
          <SelectItem
            value="week"
            className="hover:bg-black hover:text-black cursor-pointer"
          >
            Week
          </SelectItem>
          <SelectItem
            value="day"
            className="hover:bg-black hover:text-black cursor-pointer"
          >
            Day
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="lg:hidden">
        <Popover>
          <PopoverTrigger className="w-[50px] p-2 rounded-sm border border-border">
            <CarIcon className="w-8 h-5 stroke-[4px] dark:stroke-blue-200 dark:fill-blue-200 stroke-primary fill-primary" />
          </PopoverTrigger>
          <PopoverContent className="border-border p-1 px-2 bg-background">
            <CarsFilters />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
