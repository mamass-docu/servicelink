import BookServiceScreen from "../src/screens/customer/bookings/BookServiceScreen";
import PaymentOptionsScreen from "../src/screens/customer/bookings/PaymentOptionsScreen";
import RateUsScreen from "../src/screens/customer/bookings/RateUsScreen";
import CustomerMainDashboard from "../src/screens/customer/CustomerMainDashboard";
import CustomerTermsAndConditionsScreen from "../src/screens/customer/CustomerTermsAndConditionsScreen";
import GCashPaymentScreen from "../src/screens/customer/home/GCashPaymentScreen";
import MoreServices from "../src/screens/customer/home/MoreServices";
import PayMayaPaymentScreen from "../src/screens/customer/home/PayMayaPaymentScreen";
import ProviderOptionScreen from "../src/screens/customer/home/ProviderOptionScreen";
import ViewShopScreen from "../src/screens/customer/home/ShopScreen";
import Addresses from "../src/screens/customer/profile/Addresses";
import CustomerAccountSettingsScreen from "../src/screens/customer/profile/CustomerAccountSettingsScreen";
import CustomerEditProfileScreen from "../src/screens/customer/profile/CustomerEditProfile";
import CustomerTermsScreen from "../src/screens/customer/profile/CustomerTermsScreen";
import HelpSupportScreen from "../src/screens/customer/profile/HelpSupportScreen";
import PrivacyAndSecurityScreen from "../src/screens/customer/profile/PrivacyAndSecurityScreen";
import TransactionsScreen from "../src/screens/customer/profile/TransactionsScreen";
import SearchResultsScreen from "../src/screens/customer/SearchResults/SearchResultsScreen";

export const Customers = (Stack) => (
  <>
    <Stack.Screen
      name="TermsAndConditions"
      component={CustomerTermsAndConditionsScreen}
    />
    <Stack.Screen name="Main" component={CustomerMainDashboard} />
    <Stack.Screen name="Addresses" component={Addresses} />
    <Stack.Screen name="EditProfile" component={CustomerEditProfileScreen} />
    <Stack.Screen name="HelpAndSupport" component={HelpSupportScreen} />
    <Stack.Screen
      name="PrivacyAndSecurity"
      component={PrivacyAndSecurityScreen}
    />

    <Stack.Screen name="Shop" component={ViewShopScreen} />
    <Stack.Screen name="MoreServices" component={MoreServices} />
    <Stack.Screen name="ProviderOption" component={ProviderOptionScreen} />

    <Stack.Screen name="BookService" component={BookServiceScreen} />
    <Stack.Screen
      name="ServicesSearchResults"
      component={SearchResultsScreen}
    />
    <Stack.Screen name="PayMayaPayment" component={PayMayaPaymentScreen} />
    <Stack.Screen name="GCashPayment" component={GCashPaymentScreen} />
    <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
    <Stack.Screen name="CustomerTerms" component={CustomerTermsScreen} />
    <Stack.Screen name="RateUs" component={RateUsScreen} />
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen
      name="AccountSettings"
      component={CustomerAccountSettingsScreen}
    />
  </>
);
