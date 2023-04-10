/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store"

import Bills from "../containers/Bills.js"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockedBills)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList).toContain("active-icon")

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then there should be a newBills Button", () => {

      document.body.innerHTML = BillsUI({data: bills });
      const NewBillButton = screen.getByTestId('btn-new-bill')
      expect(NewBillButton).toBeTruthy()
     
    })
    test("When I click on the eye button, it should open the image modal", () => {

      document.body.innerHTML = BillsUI({data: bills });
      const EyeButton = screen.getAllByTestId('icon-eye')[0]
      const bills1 = new Bills({ document, onNavigate, store:null,localStorage: window.localStorage})
      $.fn.modal = jest.fn();
      const handleClickOnEye= jest.fn()
      bills1.handleClickOnEye=handleClickOnEye
      EyeButton.addEventListener('click',handleClickOnEye)
      fireEvent.click(EyeButton); 
      expect(handleClickOnEye).toHaveBeenCalled()
      
    });
    test("Then I can click on the New Bill button", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const handleClickNewBill = jest.fn();
      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      fireEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });

    test('clicking the "New Bill" button should call the onNavigate function with the correct route', () => {
      const mockedOnNavigate = jest.fn()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const testBills = new Bills({
        document: document,
        onNavigate: mockedOnNavigate,
        store: mockedBills,
        localStorage: localStorageMock
      })
    
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      buttonNewBill.click()
    
      expect(mockedOnNavigate).toHaveBeenCalledWith('#employee/bill/new')
    })

    
   
    
  })


  
})


describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH['Bills'])
      await waitFor(() => screen.getAllByTestId("icon-eye"))

      const MockedBillContent  = await screen.getByText("400 €")
      expect(MockedBillContent).toBeTruthy()
 
  
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockedBills, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

