const TAB_LOADING_TIMEOUT = 1000
const POPUP_LOADING_TIMEOUT = 1000
const PAGE_LOADING = 5000
const REFRESH_INTERVAL = 500

let orderForm

const getActiveTab = (orderForm, orderTabs) => {
  const inputs = orderForm.querySelectorAll('input')

  const activeTab = [...orderTabs].find((tab) => {
    return tab.classList.contains('active')
  })

  return {
    inputsOrder: inputs,
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

const setMargin = (element, margin, marginRecommend, sizeInput, size) => {
  // Open popup
  element.click()
  const marginInputContainer = document.querySelector('.leverage-container')
  const marginInput = marginInputContainer.querySelector('input')
  const marginRatio = document.querySelectorAll('.bn-slider-scale')
  const maxMargin = parseInt(
    marginRatio[marginRatio.length - 1].textContent.replace('x', '')
  )

  marginRecommend.innerHTML = `Recommend <span style="color: rgb(246, 70, 93); font-weight: 700;">${margin}</span>`
  marginInputContainer.insertAdjacentElement('beforebegin', marginRecommend)

  marginInput.focus()
  marginInput.addEventListener('blur', () => {
    setTimeout(() => {
      sizeInput.value = size
    }, 1000)
  })
}

// const setSize = (
//   entry,
//   stopLoss,
//   risk,
//   riskPercent,
//   setMarginEl,
//   marginRecommend
// ) => {
//   const { margin, size } = calMarginAndSize(entry, risk, riskPercent, stopLoss)

//   sizeInput.value = size

//   inputsOrder[4].addEventListener('blur', () => {
//     setMargin(setMarginEl[1], margin, marginRecommend)
//     console.log(margin, 'margin')
//   })
// }

const listenOrderForm = (orderInputs) => {
  const { inputsOrder, activeTab, setMarginEl } = orderInputs

  console.log(inputsOrder, 'inputsOrder ', activeTab)
  const marginRecommend = document.createElement('div')
  const sizeInput = inputsOrder[1]

  let size = 0
  let margin = 0

  if (activeTab.getAttribute('date-testid') === 'limit') {
    console.log('limit')
    inputsOrder[4].addEventListener('input', (e) => {
      const risk = parseInt(document.querySelector('#max-risk')?.value) || 5
      const riskPercent =
        parseInt(document.querySelector('#max-risk-percent')?.value) / 100 ||
        0.5
      const entry = inputsOrder[0].value.replace(',', '.')
      const stopLoss = e.target.value.replace(',', '.')

      const { margin, size } = calMarginAndSize(
        entry,
        risk,
        riskPercent,
        stopLoss
      )

      sizeInput.value = size

      inputsOrder[4].addEventListener('blur', () => {
        setMargin(setMarginEl[1], margin, marginRecommend, sizeInput, size)
        console.log(margin, 'margin')
      })
    })
  }
}

const main = (orderForm) => {
  if (orderForm) {
    const setMarginEl = orderForm.querySelectorAll(
      '.margin-leverage-or-title-row a[data-bn-type="text"]'
    )
    const orderTabs = orderForm.querySelectorAll('.order-tabs .tab')
    const riskForm = document.createElement('div')
    const parentRiskForm = document.querySelector('div[name="orderbook"]')

    riskForm.innerHTML = `<div style="background: #800303; position: absolute; top: 0; left: 0; width: calc(100% - 20px); z-index: 1;flex-direction: column; padding: 10px">
      <div style="outline: none; color: white; display: flex; justify-content: space-between; margin-bottom: 5px;">Risk <input id="max-risk" style="width: 100px;" value="5"/></div>
      <div style="outline: none; color: white; display: flex; justify-content: space-between;">Percent(%) <input id="max-risk-percent" style="width: 100px;" value="25"/></div>
    </div>`

    parentRiskForm.append(riskForm)

    let { inputsOrder, activeTab } = getActiveTab(orderForm, orderTabs)
    listenOrderForm({ inputsOrder, activeTab, setMarginEl })

    orderTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          let { inputsOrder: inputsOrderNew, activeTab: activeTabNew } =
            getActiveTab(orderForm, orderTabs)

          listenOrderForm({
            inputsOrder: inputsOrderNew,
            activeTab: activeTabNew,
            setMarginEl
          })
        }, TAB_LOADING_TIMEOUT)
      })
    })

    // orderForm.insertAdjacentElement('afterend', badge)
  }
}

const interval = setInterval(() => {
  orderForm = document.querySelector('div[name="orderForm"]')
  setTimeout(() => {
    main()
  }, PAGE_LOADING)
  main(orderForm)
  if (orderForm) {
    clearInterval(interval)
  }
}, REFRESH_INTERVAL)
