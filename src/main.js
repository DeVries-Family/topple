import { createApp } from "vue";
import { MUTATIONS, ACTIONS } from "./data";
import { createAccount } from "./models";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as fb from "./firebase";
import "./assets/tailwind.css";

let app;

fb.auth.onAuthStateChanged(user => {
  if (!app) {
    app = createApp(App)
      .use(store)
      .use(router)
      .mount("#app");
  }

  if (user) {
    store.dispatch(ACTIONS.fetchUserProfile, user);

    fb.accountsCollection
      .where("uid", "==", fb.auth.currentUser.uid)
      .onSnapshot(snapshot => {
        let accountsArray = [],
          docData,
          account;

        snapshot.forEach(doc => {
          docData = doc.data();
          docData.id = doc.id;

          account = createAccount(docData);

          accountsArray.push(account);
        });
        // console.log("Accounts updated in onSnapshot", accountsArray);
        store.commit(MUTATIONS.setAccounts, accountsArray);
      });

    fb.paymentsCollection.onSnapshot(snapshot => {
      let paymentsArray = [];

      snapshot.forEach(doc => {
        let payment = doc.data();
        payment.id = doc.id;

        paymentsArray.push(payment);
      });

      store.commit(MUTATIONS.setPayments, paymentsArray);
    });
  }
});
