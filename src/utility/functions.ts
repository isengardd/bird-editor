// 获取元素的绝对位置坐标（相对于页面左上角）
export function getElementPagePosition(element: HTMLElement) {
  //计算x坐标
  let actualLeft = element.offsetLeft;
  let current = element.offsetParent as HTMLElement;
  while (current !== null){
    actualLeft += current.offsetLeft;
    current = current.offsetParent  as HTMLElement;
  }
  //计算y坐标
  let actualTop = element.offsetTop;
  current = element.offsetParent as HTMLElement;
  while (current !== null){
    actualTop += (current.offsetTop+current.clientTop);
    current = current.offsetParent as HTMLElement;
  }
  //返回结果
  return {x: actualLeft, y: actualTop}
}