/**
 * @name CatHighlight
 * @author YourName
 * @version 1.0.0
 * @description Подсвечивает слова "кот" и "cat" в сообщениях Discord
 * @source https://github.com/hullperse/CatHighlight
 */

module.exports = class CatHighlight {
  constructor() {
    this.observer = null;
    this.highlightedElements = new Set();
  }

  getName() {
    return "CatHighlight";
  }

  getAuthor() {
    return "HullPerse";
  }

  getVersion() {
    return "1.0.0";
  }

  getDescription() {
    return "Highlights the word cat in different languages";
  }

  start() {
    this.initializeObserver();
    this.highlightExistingMessages();
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.highlightedElements.forEach(element => {
      this.removeHighlight(element);
    });
    this.highlightedElements.clear();
  }

  initializeObserver() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processNode(node);
          }
        });

        if (
          mutation.type === "childList" &&
          mutation.target.nodeType === Node.ELEMENT_NODE
        ) {
          this.processNode(mutation.target);
        }

        if (
          mutation.type === "characterData" &&
          mutation.target.nodeType === Node.TEXT_NODE
        ) {
          const parentElement = mutation.target.parentElement;
          if (parentElement && this.isMessageNode(parentElement)) {
            this.highlightMessage(parentElement);
          }
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  processNode(node) {
    if (this.isMessageNode(node)) {
      this.highlightMessage(node);
    } else {
      const messageNodes = node.querySelectorAll('[class*="messageContent"]');
      messageNodes.forEach(messageNode => {
        this.highlightMessage(messageNode);
      });
    }
  }

  isMessageNode(node) {
    return (
      node.classList &&
      (node.classList.contains("messageContent") ||
        node.classList.contains("markup") ||
        node.querySelector('[class*="messageContent"]'))
    );
  }

  highlightMessage(messageNode) {
    if (!messageNode) {
      return;
    }

    this.removeHighlight(messageNode);

    if (!this.highlightedElements.has(messageNode)) {
      this.highlightedElements.add(messageNode);
    }

    this.highlightTextInElement(messageNode);
  }

  highlightTextInElement(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      this.highlightTextNode(textNode);
    });
  }

  highlightTextNode(textNode) {
    const text = textNode.textContent;
    const highlightedText = this.highlightWords(text);

    if (highlightedText !== text) {
      const wrapper = document.createElement("span");
      wrapper.innerHTML = highlightedText;

      textNode.parentNode.replaceChild(wrapper, textNode);
    }
  }

  highlightWords(text) {
    const words = [
      "кот",
      "cat",
      "cats",
      "kitten",
      "kitty",
      "кошка",
      "киса",
      "котэ",
      "котенок",
      "котик",
      "feline",
      "kitty",
      "meow",
      "кошак",
      "neko",
    ];
    const catRegex = new RegExp(`(${words.join("|")})`, "gi");

    return text.replace(catRegex, match => {
      return `<span class="cat-highlight" style="background-color: transparent; color: red;  border-radius: 3px; font-weight: bold;">${match}</span>`;
    });
  }

  removeHighlight(element) {
    const highlights = element.querySelectorAll(".cat-highlight");
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(highlight.textContent),
          highlight
        );
        parent.normalize();
      }
    });
  }

  highlightExistingMessages() {
    const messageNodes = document.querySelectorAll('[class*="messageContent"]');
    messageNodes.forEach(messageNode => {
      this.highlightMessage(messageNode);
    });
  }
};
