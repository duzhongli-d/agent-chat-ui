"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    /**
     * The screen-reader labels for the show/hide toggle.
     *
     * This primitive is vendored from shadcn/ui and can be overwritten by the
     * `shadcn` CLI, so it must not depend on a translation context. The defaults
     * keep it usable on its own; call sites pass translated values.
     */
    showLabel?: string;
    hideLabel?: string;
  }
>(
  (
    {
      className,
      showLabel = "Show password",
      hideLabel = "Hide password",
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("hide-password-toggle pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeIcon
              className="h-4 w-4"
              aria-hidden="true"
            />
          ) : (
            <EyeOffIcon
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}
          <span className="sr-only">
            {showPassword ? hideLabel : showLabel}
          </span>
        </Button>

        {/* hides browsers password toggles */}
        <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
