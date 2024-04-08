import { Ref } from 'vue';

export function useMouse(translate: Ref<[number, number]>) {
  let dragStart: [number, number] | null = null;
  let dragStartFrozenX: number | null = null;
  let dragStartFrozenY: number | null = null;
  const handleMousedown = (event: MouseEvent) => {
    event.preventDefault();
    dragStart = [event.clientX, event.clientY];
    dragStartFrozenX = translate.value[0];
    dragStartFrozenY = translate.value[1];
  };
  const handleMouseup = (event: MouseEvent) => {
    event.preventDefault();
    dragStart = null;
    dragStartFrozenX = null;
    dragStartFrozenY = null;
  };
  const handleMousemove = (event: MouseEvent) => {
    event.preventDefault();

    if (dragStart && dragStartFrozenX !== null && dragStartFrozenY !== null) {
      const deltaX = event.clientX - dragStart[0];
      const deltaY = event.clientY - dragStart[1];
      const x = dragStartFrozenX - -deltaX;
      const y = dragStartFrozenY - -deltaY;
      translate.value = [x, y];
    }
  };

  return {
    handleMousedown,
    handleMouseup,
    handleMousemove,
  };
}
