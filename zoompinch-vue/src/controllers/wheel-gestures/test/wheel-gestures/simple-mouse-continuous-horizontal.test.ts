import macChrome from '../fixtures/simple-mouse-continuous-horizontal/mac-chrome.json'
import macFF from '../fixtures/simple-mouse-continuous-horizontal/mac-FF.json'
import macSafari from '../fixtures/simple-mouse-continuous-horizontal/mac-safari.json'
import winChrome from '../fixtures/simple-mouse-continuous-horizontal/win-Chrome.json'
import winEdge from '../fixtures/simple-mouse-continuous-horizontal/win-Edge.json'
import winFF from '../fixtures/simple-mouse-continuous-horizontal/win-FF.json'
import { recordPhases } from '../helper/recordPhases'

describe('simple mouse - continuous horizontal wheel', () => {
  describe('Mac', () => {
    it('Chrome', () => {
      expect(recordPhases(macChrome.wheelEvents)).toMatchSnapshot()
    })

    it('FF', () => {
      expect(recordPhases(macFF.wheelEvents)).toMatchSnapshot()
    })

    it('Safari', () => {
      expect(recordPhases(macSafari.wheelEvents)).toMatchSnapshot()
    })
  })

  describe('Windows', () => {
    it('Chrome', () => {
      expect(recordPhases(winChrome.wheelEvents)).toMatchSnapshot()
    })

    it('FF', () => {
      expect(recordPhases(winFF.wheelEvents)).toMatchSnapshot()
    })

    it('Edge', () => {
      expect(recordPhases(winEdge.wheelEvents)).toMatchSnapshot()
    })
  })
})
