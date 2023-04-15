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

const listenOrderForm = (inputsOrder, activeTab) => {
  console.log(inputsOrder, 'inputsOrder ', activeTab)
  const sizeInput = inputsOrder[1]
  const risk = 5
  const riskPercent = 0.5
  let size = 0
  let margin = 0

  if (activeTab.getAttribute('date-testid') === 'limit') {
    console.log('limit')
    inputsOrder[4].addEventListener('input', (e) => {
      const entry = inputsOrder[0].value
      const stopLoss = e.target.value

      const { margin, size } = calMarginAndSize(
        entry,
        risk,
        riskPercent,
        stopLoss
      )

      sizeInput.value = size

      console.log('margin = ', margin, '\nsize= ', size)
    })
  }
}

const main = (orderForm) => {
  if (orderForm) {
    const setMarginEl = orderForm.querySelectorAll(
      '.margin-leverage-or-title-row a[data-bn-type="text"]'
    )
    const orderTabs = orderForm.querySelectorAll('.order-tabs .tab')

    let { inputsOrder, activeTab } = getActiveTab(orderForm, orderTabs)
    listenOrderForm(inputsOrder, activeTab)

    orderTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          let { inputsOrder: inputsOrderNew, activeTab: activeTabNew } =
            getActiveTab(orderForm, orderTabs)

          listenOrderForm(inputsOrderNew, activeTabNew)
        }, 1000)
      })
    })

    // orderForm.insertAdjacentElement('afterend', badge)
  }
}

const interval = setInterval(() => {
  orderForm = document.querySelector('div[name="orderForm"]')
  setTimeout(() => {
    main()
  }, 5000)
  main(orderForm)
  if (orderForm) {
    clearInterval(interval)
  }
}, 500)
