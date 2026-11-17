import React, { useState } from "react";
import * as R from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
export function Select({
  children,
  value,
  defaultValue,
  name,
  onChange,
  disabled,
  required,
  className = "",
  ...props
}) {
  const options = React.Children.toArray(children).filter(React.isValidElement);
  const [local, setLocal] = useState(
    defaultValue ?? options[0]?.props.value ?? options[0]?.props.children ?? "",
  );
  const selected = value === undefined ? local : value;
  const encode = (v) => (String(v) === "" ? "__empty__" : String(v));
  return (
    <R.Root
      name={name}
      value={encode(selected)}
      disabled={disabled}
      required={required}
      onValueChange={(next) => {
        const e = { target: { value: next === "__empty__" ? "" : next } };
        onChange?.(e);
        setLocal(e.target.value);
      }}
    >
      <R.Trigger {...props} className={"select-trigger " + className}>
        <R.Value />
        <R.Icon>
          <ChevronDown size={16} />
        </R.Icon>
      </R.Trigger>
      <R.Portal>
        <R.Content
          className="select-menu"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <R.ScrollUpButton className="select-scroll">
            <ChevronUp size={14} />
          </R.ScrollUpButton>
          <R.Viewport>
            {options.map((o, i) => (
              <R.Item
                className="select-option"
                key={i}
                value={encode(o.props.value ?? o.props.children)}
                disabled={o.props.disabled}
              >
                <R.ItemText>{o.props.children}</R.ItemText>
                <R.ItemIndicator>
                  <Check size={15} />
                </R.ItemIndicator>
              </R.Item>
            ))}
          </R.Viewport>
          <R.ScrollDownButton className="select-scroll">
            <ChevronDown size={14} />
          </R.ScrollDownButton>
        </R.Content>
      </R.Portal>
    </R.Root>
  );
}
