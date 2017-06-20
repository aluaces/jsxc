import {ContactInterface} from '../ContactInterface'
import Menu from './util/Menu'
import Avatar from './Avatar'
import showVcardDialog from './dialogs/vcard';

let rosterItemTemplate = require('../../template/roster-item.hbs')

//@TODO duplicate of AbstractConnection
enum Presence {
   online,
   chat,
   away,
   xa,
   dnd,
   offline
}

export default class RosterItem {
   private element:JQuery;

   constructor(private contact:ContactInterface) {
      let self = this;
      let template = rosterItemTemplate({
         name: contact.getName(),
         lastMessage: contact.getStatus()
      });

      this.element = $(template);
      this.element.attr('data-id', this.contact.getId());
      this.element.attr('data-type', this.contact.getType());
      this.element.attr('data-presence', Presence[this.contact.getPresence()]);
      this.element.attr('data-subscription', this.contact.getSubscription());

      this.element.click(function(){
         let chatWindow = contact.openWindow();

         chatWindow.unminimize();
         chatWindow.highlight();
      });

      this.element.find('.jsxc-rename').click(function(ev) {
         ev.stopPropagation();

         self.rename();
      });

      this.element.find('.jsxc-delete').click(function(ev) {
         ev.stopPropagation();

         // showRemoveDialog(contact);
      });

      this.element.find('.jsxc-vcard').click(function(ev) {
         ev.stopPropagation();

         showVcardDialog(self.contact);
      });

      Menu.init(this.element.find('.jsxc-menu'));

      let avatar = Avatar.get(this.contact);
      avatar.addElement(this.element.find('.jsxc-avatar'));

      this.contact.registerHook('name', (newName) => {
         this.element.find('.jsxc-name').text(newName);
      });

      this.contact.registerHook('presence', () => {
         this.element.attr('data-presence', Presence[this.contact.getPresence()]);
      });

      this.contact.registerHook('status', (status) => {
         this.element.find('.jsxc-last-msg .jsxc-text').text(status);
      });

      // $(document).trigger('add.roster.jsxc', [bid, data, bud]);
   }

   public getDom() {
      return this.element;
   }

   public getContact():ContactInterface {
      return this.contact;
   }

   public detach():JQuery {
      return this.element.detach();
   }

   private rename() {
      let self = this;
      let nameElement = this.element.find('.jsxc-name');
      let optionsElement = this.element.find('.jsxc-last-msg, .jsxc-menu');
      let inputElement = $('<input type="text" name="name"/>');

      // hide more menu
      $('body').click();

      inputElement.val(nameElement.text());
      inputElement.keypress(function(ev) {
         if (ev.which !== 13) {
            return;
         }

         self.endRename();

         $('html').off('click');
      });

      // Disable html click event, if click on input
      inputElement.click(function(ev) {
         ev.stopPropagation();
      });

      optionsElement.hide();
      nameElement.hide();
      nameElement.after(inputElement);

      $('html').one('click', function(){
         self.endRename();
      });
   }

   private endRename() {
      var nameElement = this.element.find('.jsxc-name');
      var optionsElement = this.element.find('.jsxc-last-msg, .jsxc-menu');
      var inputElement = this.element.find('input');

      this.contact.setName(inputElement.val());

      inputElement.remove();
      optionsElement.show();
      nameElement.show();
   }
}
