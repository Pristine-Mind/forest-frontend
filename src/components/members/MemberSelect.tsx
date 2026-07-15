"use client";

import * as React from "react";
import { useListHouseholds } from "@/lib/api";
import { Household } from "@/lib/api/members";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Home, X } from "lucide-react";

export interface HouseholdSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  limit?: number;
  className?: string;
}

export function HouseholdSelect({
  value = "",
  onValueChange,
  placeholder = "Select household",
  disabled = false,
  allowClear = false,
  clearLabel = "No household",
  limit = 1000,
  className,
}: HouseholdSelectProps) {
  const [open, setOpen] = React.useState(false);

  const { data: householdsData, isLoading } = useListHouseholds({
    limit,
  });

  const households = householdsData?.results ?? [];

  const selectedHousehold = households.find((h) => String(h.id) === value);

  function handleSelect(household: Household | null) {
    onValueChange?.(household ? String(household.id) : "");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedHousehold ? (
              <>
                <Home className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">
                  {selectedHousehold.english_name || selectedHousehold.household_head_name}
                </span>
              </>
            ) : (
              <>
                <Home className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">{isLoading ? "Loading..." : placeholder}</span>
              </>
            )}
          </span>
          <span className="flex items-center gap-1">
            {value && allowClear && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(null);
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search by household name, English name, or head..." />
          <CommandList>
            <CommandEmpty>No household found.</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem
                  value=""
                  onSelect={() => handleSelect(null)}
                  className="text-muted-foreground"
                >
                  {clearLabel}
                </CommandItem>
              )}
              {households.map((household) => (
                <CommandItem
                  key={household.id}
                  value={`${household.household_head_name} ${household.english_name ?? ""} ${household.household_head_name ?? ""} ${household.id}`}
                  onSelect={() => handleSelect(household)}
                >
                  <Home className="h-4 w-4 shrink-0 text-primary mr-2" />
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm">
                      {household.english_name || household.household_head_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {household.household_head_name && (
                        <>Head: {household.household_head_name}</>
                      )}
                      {household.household_head_name && household.english_name && " • "}
                      {household.english_name && household.english_name !== household.household_head_name && (
                        <>{household.english_name}</>
                      )}
                    </span>
                  </span>
                  {value === String(household.id) && (
                    <span className="ml-2 text-primary">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default HouseholdSelect;
