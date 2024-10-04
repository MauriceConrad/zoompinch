import slowDragRight from '../fixtures/slow-drag-right.json'
import squareMove from '../fixtures/square-move-trackpad.json'
import { recordPhases } from '../helper/recordPhases'

describe('drag', () => {
  it('slow drag', () => {
    expect(recordPhases(slowDragRight.wheelEvents)).toMatchSnapshot()
  })

  it('square move - trackpad (tl -> tr -> br -> bl -> tl)', () => {
    expect(recordPhases(squareMove.wheelEvents)).toMatchSnapshot()
  })
})
