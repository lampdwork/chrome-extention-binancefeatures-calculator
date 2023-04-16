const $ = (el) => document.querySelector(el)
const $$ = (el) => document.querySelectorAll(el)

const MARGIN_BUTTON_QUERY =
  '.margin-leverage-or-title-row a[data-bn-type="text"]'
const ORDER_FORM_QUERY = `div[name=orderForm]`
const INPUT_PRICE_QUERY = `input[id^="limitPrice"]`
const POSITION_SIZE_QUERY = `input[id^="unitAmount"]`
const TAKE_PROFIT_QUERY = `input[id^="takeProfitStopPrice"]`
const STOP_LOSS_QUERY = `input[id^="stopLossStopPrice"]`
const LAST_PRICE_BTN_QUERY = `div[data-bn-type='text']`
const UOM_QUERY = `label[data-testid='unit-select-button']`
const LAST_PRICE_QUERY = `.ticker-wrap .draggableHandle`
const TAB_MARKET_QUERY = `#tab-MARKET > .active`
const TAB_LIMIT_QUERY = `#tab-LIMIT > .active`

const TAB_LOADING_TIMEOUT = 1000
const POPUP_LOADING_TIMEOUT = 500
const PAGE_LOADING = 5000
const REFRESH_INTERVAL = 500

let orderForm

const setInputValue = (inputEl, value) => {
  inputEl.value = value
  inputEl.dispatchEvent(new Event('change', { bubbles: true }))
}

const getActiveTab = (orderTabs) => {
  const activeTab = [...orderTabs].find((tab) => {
    return tab.classList.contains('active')
  })

  return {
    activeTab
  }
}

const calMarginAndSize = (entry, risk, riskPercent, stopLoss) => {
  const margin = Math.ceil((riskPercent * entry) / Math.abs(entry - stopLoss))
  return {
    margin,
    size: (risk / riskPercent) * margin
  }
}

const setMargin = (marginParam) => {
  const { element, margin, marginRecommend, sizeInput, size } = marginParam
  // Open popup
  element.click()

  setTimeout(() => {
    const marginInputContainer = document.querySelector('.leverage-container')
    const marginInput = $('.leverage-container input')
    const marginRatio = document.querySelectorAll('.bn-slider-scale')
    const confirmButton = document.querySelector('.footer > button')
    const maxMargin = parseInt(
      marginRatio[marginRatio.length - 1].textContent.replace('x', '')
    )

    marginInputContainer.insertAdjacentElement('beforebegin', marginRecommend)

    setInputValue(marginInput, margin)

    setTimeout(() => {
      if (maxMargin >= margin) {
        confirmButton.click()
      }
    }, POPUP_LOADING_TIMEOUT)

    confirmButton.addEventListener('click', () => {
      setTimeout(() => {
        setInputValue(sizeInput, size)
      }, 1000)
    })
  }, POPUP_LOADING_TIMEOUT)
}

const updateSizeAndMargin = (
  inputLimitPrice,
  inputStopLoss,
  type,
  marginRecommend
) => {
  const lastPrice = $(LAST_PRICE_QUERY)
  const sizeInput = $(POSITION_SIZE_QUERY)
  const marginBtn = $$(MARGIN_BUTTON_QUERY)
  const currMargin = parseInt(marginBtn[1].textContent.replace('x', ''))

  const entry =
    type === 'limit'
      ? inputLimitPrice.value.replace(',', '.')
      : parseInt(lastPrice.textContent)
  const stopLoss = inputStopLoss.value.replace(',', '.')

  const risk = parseInt($('#max-risk')?.value) || 5
  const riskPercent = parseInt($('#max-risk-percent')?.value) / 100 || 0.5

  const { margin, size } = calMarginAndSize(entry, risk, riskPercent, stopLoss)

  console.log('Margin: ', margin, '\nSize: ', size)

  if (size > 0) {
    setInputValue(sizeInput, size)
  }

  if (currMargin !== margin) {
    marginRecommend.innerHTML = `Recommend <span style="color: rgb(246, 70, 93); font-weight: 700;">${margin}</span>`
    setMargin({
      element: marginBtn[1],
      margin,
      marginRecommend,
      sizeInput,
      size
    })
  }
}

const calculator = (type, marginRecommend) => {
  const inputStopLoss = $(STOP_LOSS_QUERY)
  const inputLimitPrice = $(INPUT_PRICE_QUERY)

  // if (inputStopLoss.value) {
  //   updateSizeAndMargin(inputLimitPrice, inputStopLoss, type, marginRecommend)
  // }

  inputStopLoss?.addEventListener('blur', (e) => {
    e.preventDefault()
    updateSizeAndMargin(inputLimitPrice, inputStopLoss, type, marginRecommend)
  })
  inputLimitPrice?.addEventListener('blur', (e) => {
    e.preventDefault()
    updateSizeAndMargin(inputLimitPrice, inputStopLoss, type, marginRecommend)
  })
}

let tabInterval
const listenOrderForm = (orderInputs) => {
  const marginRecommend = document.createElement('div')

  const { activeTab } = orderInputs
  const tab = activeTab.getAttribute('date-testid')
  clearInterval(tabInterval)

  const calTab = {
    limit: () => {
      // tabInterval = setInterval(() => {
      calculator('limit', marginRecommend)
      // }, 1000)
    },
    market: () => {
      // tabInterval = setInterval(() => {
      calculator('market', marginRecommend)
      // }, 1000)
    }
  }

  calTab[tab]()
}

const addRiskForm = () => {
  const riskForm = document.createElement('div')
  const parentRiskForm = document.querySelector('div[name="orderbook"]')

  riskForm.innerHTML = `<div style="background: #800303; position: absolute; top: 0; left: 0; width: calc(100% - 20px); z-index: 1;flex-direction: column; padding: 10px">
    <div style="outline: none; color: white; display: flex; justify-content: space-between; margin-bottom: 5px;">Risk <input id="max-risk" style="width: 100px;" value="5"/></div>
    <div style="outline: none; color: white; display: flex; justify-content: space-between;">Percent (%) <input id="max-risk-percent" style="width: 100px;" value="25"/></div>
  </div>`

  parentRiskForm.append(riskForm)
}

const main = (orderForm) => {
  if (orderForm) {
    const orderTabs = orderForm.querySelectorAll('.order-tabs .tab')
    addRiskForm()

    let { activeTab } = getActiveTab(orderTabs)

    listenOrderForm({ activeTab })

    orderTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          let { activeTab: newActiveTab } = getActiveTab(orderTabs)
          console.log(newActiveTab, 'activeTab')

          listenOrderForm({ activeTab: newActiveTab })
        }, TAB_LOADING_TIMEOUT)
      })
    })

    // orderForm.insertAdjacentElement('afterend', badge)
  }
}

const interval = setInterval(() => {
  orderForm = document.querySelector(ORDER_FORM_QUERY)
  setTimeout(() => {
    main()
  }, PAGE_LOADING)
  main(orderForm)
  if (orderForm) {
    clearInterval(interval)
  }
}, REFRESH_INTERVAL)

setTimeout(() => {
  clearInterval(interval)
}, 60000)
