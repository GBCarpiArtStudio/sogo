(function(){"use strict";angular.module("SOGo.PreferencesUI",["ngSanitize","ui.router","ck","SOGo.Common","SOGo.MailerUI","SOGo.ContactsUI","SOGo.Authentication"]).config(configure).run(runBlock);configure.$inject=["$stateProvider","$urlRouterProvider"];function configure($stateProvider,$urlRouterProvider){$stateProvider.state("preferences",{"abstract":true,views:{preferences:{templateUrl:"preferences.html",controller:"PreferencesController",controllerAs:"app"}},resolve:{statePreferences:statePreferences}}).state("preferences.general",{url:"/general",views:{module:{templateUrl:"generalPreferences.html"}}}).state("preferences.calendars",{url:"/calendars",views:{module:{templateUrl:"calendarsPreferences.html"}}}).state("preferences.addressbooks",{url:"/addressbooks",views:{module:{templateUrl:"addressbooksPreferences.html"}}}).state("preferences.mailer",{url:"/mailer",views:{module:{templateUrl:"mailerPreferences.html"}}});$urlRouterProvider.otherwise("/general")}statePreferences.$inject=["Preferences"];function statePreferences(Preferences){return Preferences}runBlock.$inject=["$rootScope"];function runBlock($rootScope){$rootScope.$on("$routeChangeError",function(event,current,previous,rejection){console.error(event,current,previous,rejection)})}})();(function(){"use strict";AccountDialogController.$inject=["$mdDialog","defaults","account","accountId","mailCustomFromEnabled"];function AccountDialogController($mdDialog,defaults,account,accountId,mailCustomFromEnabled){var vm=this;vm.defaults=defaults;vm.account=account;vm.accountId=accountId;vm.customFromIsReadonly=customFromIsReadonly;vm.cancel=cancel;vm.save=save;function customFromIsReadonly(){if(accountId>0)return false;return!mailCustomFromEnabled}function cancel(){$mdDialog.cancel()}function save(){$mdDialog.hide()}}angular.module("SOGo.PreferencesUI").controller("AccountDialogController",AccountDialogController)})();(function(){"use strict";FiltersDialogController.$inject=["$scope","$window","$mdDialog","filter","mailboxes","labels"];function FiltersDialogController($scope,$window,$mdDialog,filter,mailboxes,labels){var vm=this,sieveCapabilities=$window.sieveCapabilities;vm.filter=filter;vm.mailboxes=mailboxes;vm.labels=labels;vm.cancel=cancel;vm.save=save;vm.addMailFilterRule=addMailFilterRule;vm.removeMailFilterRule=removeMailFilterRule;vm.addMailFilterAction=addMailFilterAction;vm.removeMailFilterAction=removeMailFilterAction;vm.fieldLabels={subject:l("Subject"),from:l("From"),to:l("To"),cc:l("Cc"),to_or_cc:l("To or Cc"),size:l("Size (Kb)"),header:l("Header")};if(sieveCapabilities.indexOf("body")>-1)vm.fieldLabels.body=l("Body");vm.methodLabels={discard:l("Discard the message"),keep:l("Keep the message"),redirect:l("Forward the message to:"),vacation:l("Send a vacation message"),stop:l("Stop processing filter rules")};if(sieveCapabilities.indexOf("reject")>-1)vm.methodLabels.reject=l("Send a reject message:");if(sieveCapabilities.indexOf("fileinto")>-1)vm.methodLabels.fileinto=l("File the message in:");if(sieveCapabilities.indexOf("imapflags")>-1||sieveCapabilities.indexOf("imap4flags")>-1)vm.methodLabels.addflag=l("Flag the message with:");vm.numberOperatorLabels={under:l("is under"),over:l("is over")};vm.textOperatorLabels={is:l("is"),is_not:l("is not"),contains:l("contains"),contains_not:l("does not contain"),matches:l("matches"),matches_not:l("does not match")};if(sieveCapabilities.indexOf("regex")>-1){vm.textOperatorLabels.regex=l("matches regex");vm.textOperatorLabels.regex_not=l("does not match regex")}vm.flagLabels={seen:l("Seen"),deleted:l("Deleted"),answered:l("Answered"),flagged:l("Flagged"),junk:l("Junk"),not_junk:l("Not Junk")};function cancel(){$mdDialog.cancel()}function save(form){$mdDialog.hide()}function addMailFilterRule(event){if(!vm.filter.rules)vm.filter.rules=[];vm.filter.rules.push({field:"subject",operator:"contains"})}function removeMailFilterRule(index){vm.filter.rules.splice(index,1)}function addMailFilterAction(event){if(!vm.filter.actions)vm.filter.actions=[];vm.filter.actions.push({method:"discard"})}function removeMailFilterAction(index){vm.filter.actions.splice(index,1)}}angular.module("SOGo.PreferencesUI").controller("FiltersDialogController",FiltersDialogController)})();(function(){"use strict";PreferencesController.$inject=["$q","$window","$state","$mdDialog","$mdToast","Dialog","User","Account","statePreferences","Authentication"];function PreferencesController($q,$window,$state,$mdDialog,$mdToast,Dialog,User,Account,statePreferences,Authentication){var vm=this,account,mailboxes=[];vm.preferences=statePreferences;vm.passwords={newPassword:null,newPasswordConfirmation:null};vm.go=go;vm.onLanguageChange=onLanguageChange;vm.addCalendarCategory=addCalendarCategory;vm.removeCalendarCategory=removeCalendarCategory;vm.addContactCategory=addContactCategory;vm.removeContactCategory=removeContactCategory;vm.addMailAccount=addMailAccount;vm.editMailAccount=editMailAccount;vm.removeMailAccount=removeMailAccount;vm.addMailLabel=addMailLabel;vm.removeMailLabel=removeMailLabel;vm.addMailFilter=addMailFilter;vm.editMailFilter=editMailFilter;vm.removeMailFilter=removeMailFilter;vm.addDefaultEmailAddresses=addDefaultEmailAddresses;vm.userFilter=User.$filter;vm.save=save;vm.canChangePassword=canChangePassword;vm.changePassword=changePassword;vm.timeZonesList=window.timeZonesList;vm.timeZonesListFilter=timeZonesListFilter;vm.timeZonesSearchText="";account=new Account({id:0});account.$getMailboxes().then(function(){var allMailboxes=account.$flattenMailboxes({all:true}),index=-1,length=allMailboxes.length;while(++index<length){mailboxes.push(allMailboxes[index])}});statePreferences.ready().then(function(){if(statePreferences.defaults.SOGoAlternateAvatar)User.$alternateAvatar=statePreferences.defaults.SOGoAlternateAvatar});function go(module){$state.go("preferences."+module)}function onLanguageChange(){Dialog.confirm(l("Warning"),l("Save preferences and reload page now?"),{ok:l("Yes"),cancel:l("No")}).then(function(){save().then(function(){$window.location.reload(true)})})}function addCalendarCategory(){vm.preferences.defaults.SOGoCalendarCategoriesColors["New category"]="#aaa";vm.preferences.defaults.SOGoCalendarCategories.push("New category")}function removeCalendarCategory(index){var key=vm.preferences.defaults.SOGoCalendarCategories[index];vm.preferences.defaults.SOGoCalendarCategories.splice(index,1);delete vm.preferences.defaults.SOGoCalendarCategoriesColors[key]}function addContactCategory(){vm.preferences.defaults.SOGoContactsCategories.push("")}function removeContactCategory(index){vm.preferences.defaults.SOGoContactsCategories.splice(index,1)}function addMailAccount(ev){var account;vm.preferences.defaults.AuxiliaryMailAccounts.push({});account=_.last(vm.preferences.defaults.AuxiliaryMailAccounts);account.name=l("New account");account.identities=[{fullName:"",email:""}];account.receipts={receiptAction:"ignore",receiptNonRecipientAction:"ignore",receiptOutsideDomainAction:"ignore",receiptAnyAction:"ignore"};$mdDialog.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account=new",targetEvent:ev,locals:{defaults:vm.preferences.defaults,account:account,accountId:vm.preferences.defaults.AuxiliaryMailAccounts.length-1,mailCustomFromEnabled:window.mailCustomFromEnabled}})}function editMailAccount(event,index){var account=vm.preferences.defaults.AuxiliaryMailAccounts[index];$mdDialog.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account="+index,targetEvent:event,locals:{defaults:vm.preferences.defaults,account:account,accountId:index,mailCustomFromEnabled:window.mailCustomFromEnabled}}).then(function(){vm.preferences.defaults.AuxiliaryMailAccounts[index]=account})}function removeMailAccount(index){vm.preferences.defaults.AuxiliaryMailAccounts.splice(index,1)}function addMailLabel(){vm.preferences.defaults.SOGoMailLabelsColors.new_label=["New label","#aaa"]}function removeMailLabel(key){delete vm.preferences.defaults.SOGoMailLabelsColors[key]}function addMailFilter(ev){var filter={match:"all"};$mdDialog.show({templateUrl:"editFilter?filter=new",controller:"FiltersDialogController",controllerAs:"filterEditor",targetEvent:ev,locals:{filter:filter,mailboxes:mailboxes,labels:vm.preferences.defaults.SOGoMailLabelsColors}}).then(function(){if(!vm.preferences.defaults.SOGoSieveFilters)vm.preferences.defaults.SOGoSieveFilters=[];vm.preferences.defaults.SOGoSieveFilters.push(filter)})}function editMailFilter(ev,index){var filter=angular.copy(vm.preferences.defaults.SOGoSieveFilters[index]);$mdDialog.show({templateUrl:"editFilter?filter="+index,controller:"FiltersDialogController",controllerAs:"filterEditor",targetEvent:null,locals:{filter:filter,mailboxes:mailboxes,labels:vm.preferences.defaults.SOGoMailLabelsColors}}).then(function(){vm.preferences.defaults.SOGoSieveFilters[index]=filter})}function removeMailFilter(index){vm.preferences.defaults.SOGoSieveFilters.splice(index,1)}function addDefaultEmailAddresses(){var v=[];if(angular.isDefined(vm.preferences.defaults.Vacation.autoReplyEmailAddresses)){v=vm.preferences.defaults.Vacation.autoReplyEmailAddresses.split(",")}vm.preferences.defaults.Vacation.autoReplyEmailAddresses=_.union(window.defaultEmailAddresses.split(","),v).join(",")}function save(){var i,sendForm,addresses,defaultAddresses,domains,domain;sendForm=true;domains=[];if(window.forwardConstraints>0&&angular.isDefined(vm.preferences.defaults.Forward)&&vm.preferences.defaults.Forward.enabled&&angular.isDefined(vm.preferences.defaults.Forward.forwardAddress)){addresses=vm.preferences.defaults.Forward.forwardAddress.split(",");defaultAddresses=window.defaultEmailAddresses.split(/, */);_.forEach(defaultAddresses,function(adr){var domain=adr.split("@")[1];if(domain){domains.push(domain.toLowerCase())}});for(i=0;i<addresses.length&&sendForm;i++){domain=addresses[i].split("@")[1].toLowerCase();if(domains.indexOf(domain)<0&&window.forwardConstraints==1){Dialog.alert(l("Error"),l("You are not allowed to forward your messages to an external email address."));sendForm=false}else if(domains.indexOf(domain)>=0&&window.forwardConstraints==2){Dialog.alert(l("Error"),l("You are not allowed to forward your messages to an internal email address."));sendForm=false}}}if(sendForm)return vm.preferences.$save().then(function(data){$mdToast.show({controller:"savePreferencesToastCtrl",template:["<md-toast>",'  <div class="md-toast-content">',"    <span flex>"+l("Preferences saved")+"</span>",'    <md-button class="md-icon-button md-primary" ng-click="closeToast()">',"      <md-icon>close</md-icon>","    </md-button>","  </div>","</md-toast>"].join(""),hideDelay:2e3,position:"top right"})});return $q.reject()}function canChangePassword(){if(vm.passwords.newPassword&&vm.passwords.newPassword.length>0&&vm.passwords.newPasswordConfirmation&&vm.passwords.newPasswordConfirmation.length&&vm.passwords.newPassword==vm.passwords.newPasswordConfirmation)return true;return false}function changePassword(){Authentication.changePassword(vm.passwords.newPassword).then(function(){var alert=$mdDialog.alert({title:l("Password"),content:l("The password was changed successfully."),ok:l("OK")});$mdDialog.show(alert).finally(function(){alert=undefined})},function(msg){var alert=$mdDialog.alert({title:l("Password"),content:msg,ok:l("OK")});$mdDialog.show(alert).finally(function(){alert=undefined})})}function timeZonesListFilter(filter){return _.filter(vm.timeZonesList,function(value){return value.toUpperCase().indexOf(filter.toUpperCase())>=0})}}savePreferencesToastCtrl.$inject=["$scope","$mdToast"];function savePreferencesToastCtrl($scope,$mdToast){$scope.closeToast=function(){$mdToast.hide()}}angular.module("SOGo.PreferencesUI").controller("savePreferencesToastCtrl",savePreferencesToastCtrl).controller("PreferencesController",PreferencesController)})();
//# sourceMappingURL=Preferences.js.map