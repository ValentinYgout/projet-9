/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES,ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'User'
      }))
    });

    
    test('handleChangeFile should set isFileJpgOrPng to true when a JPEG or PNG file is selected', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate:onNavigate,
        store:mockedBills,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(newBill.isFileJpgOrPng).toBe(true)
    })
    test('handleChangeFile should set isFileJpgOrPng to false when a file that is neither JPEG nor PNG is selected', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate:onNavigate,
        store:mockedBills,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.svg', { type: 'image/svg' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(newBill.isFileJpgOrPng).toBe(false)
    })
    test('handleSubmit is called when form is submitted', () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill1 = new NewBill({
        document,
        onNavigate:onNavigate,
        store:mockedBills,
        localStorage: window.localStorage
      })

      const form = screen.getByTestId('form-new-bill')
      const expenseType= screen.getByTestId('expense-type')
      expenseType.value="Transports"
      const datepicker= screen.getByTestId('datepicker')
      datepicker.value="2022-04-01"
      const vat= screen.getByTestId('vat')
      vat.value="40"
      const pct= screen.getByTestId('pct')
      pct.value= " 30"
      const commentary= screen.getByTestId('commentary')
      commentary.value="This is a test"
      newBill1.fileUrl="somefakeurl"
      newBill1.fileName="somefakename"
      
      const handleSubmit= jest.fn()
      const updateBill = jest.fn()
      newBill1.updateBill=updateBill
      newBill1.handleSubmit=handleSubmit
      form.addEventListener('submit',handleSubmit)
      fireEvent.submit(form)




  

      expect(handleSubmit).toHaveBeenCalled()
      expect(updateBill).toHaveBeenCalled()
    })


  })
})
