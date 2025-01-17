import classNames from "classnames";
import { FC, memo } from "react";
import { DraggableData, Position, ResizableDelta, Rnd } from "react-rnd";
import { useSnapshot }                 from "valtio";
import { useGetState, useUpdateState } from "@/client";
import { ElementInstance }             from "@/client/ui/element-instance";

const Knob: FC<{ className: string }> = ({ className }) => {
  return <div className={classNames("absolute rounded-full bg-primary w-2 h-2", className)}></div>
}

export const ElementEditorTransform: FC<{ id: string }> = memo(({ id }) => {
  const rect = useGetState(state => state.elements[id].scenes["main"].rect);
  const { tab, show } = useSnapshot(window.ApiServer.ui.sidebarState);
  const update = useUpdateState();

  const selected = show && tab?.value === id;

  const selectElement = () => {
    const state = window.ApiClient.document.fileBinder.get();
    const element = state.elements[id]
    window.ApiServer.changeTab({ tab: element.type, value: id });
  }

  const handleDrag = (_e: any, data: DraggableData) => {
    selected && update(state => {
      state.elements[id].scenes["main"].rect.x = Math.round(data.x);
      state.elements[id].scenes["main"].rect.y = Math.round(data.y);
    });
  }
  const handleResize = (_e: MouseEvent | TouchEvent, _dir: unknown, elementRef: HTMLElement, _delta: ResizableDelta, position: Position) => {
    selected && update(state => {
      state.elements[id].scenes["main"].rect.x = Math.round(position.x);
      state.elements[id].scenes["main"].rect.y = Math.round(position.y);
      state.elements[id].scenes["main"].rect.w = Math.round(elementRef.offsetWidth);
      state.elements[id].scenes["main"].rect.h = Math.round(elementRef.offsetHeight);
    });
  }

  return <Rnd className={classNames("group", { "z-50": selected })}
    size={{
      width: rect?.w || 100,
      height: rect?.h || 100
    }}
    onDrag={e => {
      if (!selected)
        return false
    }}
    position={{
      x: rect?.x ?? 0,
      y: rect?.y ?? 0,
    }}
    enableResizing={selected}
    onDragStop={handleDrag}
    onResizeStop={handleResize}
  >
    <ElementInstance id={id} />
    <div
      onDoubleClick={e => { e.preventDefault(); e.stopPropagation(); selectElement() }}
      className={classNames("absolute inset-0 border-2 border-dashed opacity-0 border-secondary/50 transition-opacity",
        selected ? "opacity-100 border-primary cursor-move" : "group-hover:opacity-30 cursor-pointer"
      )}>
      {selected && <>
        <Knob className="-bottom-1 -left-1" />
        <Knob className="-bottom-1 -right-1" />
        <Knob className="-top-1 -right-1" />
        <Knob className="-top-1 -left-1" />
      </>}
    </div>
  </Rnd>
});
