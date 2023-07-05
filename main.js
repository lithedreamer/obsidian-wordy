"use strict";
/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  SearchableWordsModal: () => SearchableWordsModal,
  default: () => WordyPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// DatamuseApi.ts
var DatamuseApi = class {
  constructor() {
    this.baseUrl = new URL("https://api.datamuse.com/words");
  }
  async wordsSimilarTo(rootWord, extra = false) {
    const results = [];
    const urls = [
      "rel_syn",
      "rel_spc",
      "rel_gen",
      "rel_com",
      "rel_par"
    ];
    await Promise.all(urls.map(async (queryParam) => {
      results.push(...await this.relatedWords(queryParam, rootWord));
    }));
    if (extra) {
      const extraResults = [];
      await Promise.all(results.map(async (similiarWord) => {
        extraResults.push(...await this.relatedWords("rel_syn", similiarWord));
      }));
      results.push(...extraResults);
    }
    return results;
  }
  async wordsOppositeTo(rootWord, extra = false) {
    const results = [];
    results.push(...await this.relatedWords("rel_ant", rootWord));
    const syns = await this.relatedWords("rel_syn", rootWord);
    Promise.all(syns.map(async (wordLikeRootWord) => {
      const data = await this.relatedWords("rel_ant", wordLikeRootWord);
      results.push(...data);
    }));
    if (extra) {
      const extraResults = [];
      const synonyms = [...await this.wordsSimilarTo(rootWord)];
      await Promise.all(synonyms.map(async (similiarWord) => {
        const antonyms = await this.relatedWords("rel_ant", similiarWord);
        extraResults.push(...antonyms);
      }));
      results.push(...extraResults);
    }
    return this.cleanUp(results);
  }
  async wordsThatRhymeWith(rootWord) {
    const results = [];
    const urls = ["rel_rhy", "rel_nry", "rel_hom", "rel_cns"];
    await Promise.all(urls.map(async (queryParam) => {
      results.push(...await this.relatedWords(queryParam, rootWord));
    }));
    return this.cleanUp(results);
  }
  async alliterativeSynonyms(priorWord, rootWord) {
    const data = await this.wordsSimilarTo(rootWord, true);
    return [
      ...data.filter((w) => w.startsWith(priorWord[0])).map((syn) => `${priorWord} ${syn}`)
    ];
  }
  cleanUp(results) {
    return [...new Set(results.filter((el) => !!el))];
  }
  async relatedWords(queryParam, rootWord) {
    const results = [];
    const url = `${this.baseUrl}?${queryParam}=${rootWord}`;
    const resp = await fetch(url);
    const data = await resp.json();
    results.push(...data.map((o) => o.word));
    return results;
  }
};

// main.ts
var DEFAULT_SETTINGS = {
  enumeratedWords: true
};
var WordyPlugin = class extends import_obsidian.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.settings = {
      enumeratedWords: true
    };
    this.datamuseApi = new DatamuseApi();
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "wordy-syn",
      name: "Synonyms",
      editorCallback: async (editor, view) => {
        const rootWord = editor.getSelection();
        if (rootWord != "") {
          const similarWords = await this.datamuseApi.wordsSimilarTo(rootWord);
          if (similarWords.length == 0) {
            new import_obsidian.Notice(`Oops \u2014 No synonyms found.`);
            return;
          }
          new SearchableWordsModal(this.app, similarWords, (selectedWord) => {
            editor.replaceSelection(selectedWord);
          }).open();
        } else {
          new import_obsidian.Notice(`Oops \u2014 Select a word first.`);
        }
      }
    });
    this.addCommand({
      id: "wordy-ant",
      name: "Antonyms",
      editorCallback: async (editor, view) => {
        const rootWord = editor.getSelection();
        if (rootWord != "") {
          const oppositeWords = await this.datamuseApi.wordsOppositeTo(rootWord, true);
          if (oppositeWords.length == 0) {
            new import_obsidian.Notice(`Oops \u2014 No antonyms found.`);
            return;
          }
          new SearchableWordsModal(this.app, oppositeWords, (selectedWord) => {
            editor.replaceSelection(selectedWord);
          }).open();
        } else {
          new import_obsidian.Notice(`Oops \u2014 Select a word first.`);
        }
      }
    });
    this.addCommand({
      id: "wordy-rhy",
      name: "Rhymes",
      editorCallback: async (editor, view) => {
        const rootWord = editor.getSelection();
        if (rootWord != "") {
          const rhymes = await this.datamuseApi.wordsThatRhymeWith(rootWord);
          if (rhymes.length == 0) {
            new import_obsidian.Notice(`Oops \u2014 No rhymes found.`);
            return;
          }
          new SearchableWordsModal(this.app, rhymes, (selectedWord) => {
            editor.replaceSelection(selectedWord);
          }).open();
        } else {
          new import_obsidian.Notice(`Oops \u2014 Select a word first.`);
        }
      }
    });
    this.addCommand({
      id: "wordy-asyn",
      name: "Alliterative Synonyms",
      editorCallback: async (editor, view) => {
        const [priorWord, rootWord] = editor.getSelection().split(" ");
        if (rootWord != "") {
          const alliterativeSynonyms = await this.datamuseApi.alliterativeSynonyms(priorWord, rootWord);
          if (alliterativeSynonyms.length == 0) {
            new import_obsidian.Notice(`Oops \u2014 No rhymes found.`);
            return;
          }
          new SearchableWordsModal(this.app, alliterativeSynonyms, (selectedWord) => {
            editor.replaceSelection(`${selectedWord}`);
          }).open();
        } else {
          new import_obsidian.Notice(`Oops \u2014 Select a word first.`);
        }
      }
    });
    this.addSettingTab(new WordyPluginSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var SearchableWordsModal = class extends import_obsidian.SuggestModal {
  constructor(app, words, replaceFn) {
    super(app);
    this.words = words;
    this.replaceFn = replaceFn;
    if (words.length == 0) {
      return;
    }
  }
  getSuggestions(query) {
    return this.words.filter((word) => word.toLowerCase().includes(query.toLowerCase()));
  }
  renderSuggestion(word, el) {
    el.createEl("div", { text: word });
  }
  onChooseSuggestion(word, evt) {
    this.replaceFn(word);
  }
};
var WordyPluginSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings" });
    containerEl.createEl("p").setText("Nothing to configure yet!");
  }
};
