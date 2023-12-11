import re
import nltk
from textblob import TextBlob
from nltk.corpus import stopwords

# Ensure nltk dependencies are downloaded
nltk.download('punkt')
nltk.download('stopwords')

class FullText:
    def __init__(self, text):
        self.fullTextString = text
        self.wordCount = len(text.split())
        self.paragraphList = [Paragraph(p) for p in re.split(r'\n\s*\n', text.strip())]
        self.analyzeTextFeatures()

    def analyzeTextFeatures(self):
        self.oxfordComma, self.oxfordCommaContradiction = self.oxfordCommaCheck()
        self.commaFreak = self.commaFreakCheck()
        self.hyphen = self.hyphenCheck()
        self.exclamationMark = self.exclamationMarkCheck()
        self.questionMark = self.questionMarkCheck()
        #self.spellingErrors = self.spellingCheck()
        self.calculateAggregateScores()

    def oxfordCommaCheck(self):
        oxfordComma, noxfordcomma = False, False
        oxford_pattern = r',\s+(and|or)\s+'
        noxford_pattern = r'[^,]\s+(and|or)\s+'
        for paragraph in self.paragraphList:
            if re.search(oxford_pattern, paragraph.paragraphText):
                oxfordComma = True
            if re.search(noxford_pattern, paragraph.paragraphText):
                noxfordcomma = True
        return oxfordComma, oxfordComma and noxfordcomma

    def commaFreakCheck(self):
        sentenceCount = sum(len(p.sentenceList) for p in self.paragraphList)
        commaCount = self.fullTextString.count(',')
        return commaCount / max(sentenceCount, 1)

    def hyphenCheck(self):
        return '-' in self.fullTextString

    def exclamationMarkCheck(self):
        return '!' in self.fullTextString

    def questionMarkCheck(self):
        return '?' in self.fullTextString

    def spellingCheck(self):
        textBlob = TextBlob(self.fullTextString)
        correctedText = str(textBlob.correct())
        original_words = self.fullTextString.split()
        corrected_words = correctedText.split()
        return sum(1 for o, c in zip(original_words, corrected_words) if o != c)

    def calculateAggregateScores(self):
        self.verbosityScore = sum(p.verbosityScore for p in self.paragraphList) / max(len(self.paragraphList), 1)
        self.formalityScore = sum(p.formalityScore for p in self.paragraphList) / max(len(self.paragraphList), 1)
        self.toneScore = sum(p.toneScore for p in self.paragraphList) / max(len(self.paragraphList), 1)

class Paragraph:
    def __init__(self, text):
        self.paragraphText = text
        self.paraWordCount = len(text.split())
        self.sentenceList = [Sentence(s) for s in nltk.sent_tokenize(text)]
        self.calculateParagraphFeatures()

    def calculateParagraphFeatures(self):
        self.verbosityScore = self.paraWordCount / max(len(self.sentenceList), 1)
        self.formalityScore = sum(s.formalityScore for s in self.sentenceList) / max(len(self.sentenceList), 1)
        self.toneScore = TextBlob(self.paragraphText).sentiment.polarity

class Sentence:
    def __init__(self, text):
        self.sentenceText = text
        self.sentenceWordCount = len(text.split())
        self.formalityScore = self.calculateFormality()

    def calculateFormality(self):
        tokenizedText = nltk.word_tokenize(self.sentenceText)
        filteredSentence = [w for w in tokenizedText if w.lower() not in stopwords.words('english')]
        letter_counts = [len(word) for word in filteredSentence]
        return sum(letter_counts) / max(len(filteredSentence), 1)

def compare_texts(analysis1, analysis2):
    metrics = {
        "toneScore": False,
        "oxfordComma": True,
        "123": False,
        "hyphen": True,
        "exclamationMark": True,
        "questionMark": True,
        #"spellingErrors": False,
        "formalityScore": False,
        "verbosityScore": False
    }

    results = {}
    for metric, is_boolean in metrics.items():
        value1 = getattr(analysis1, metric)
        value2 = getattr(analysis2, metric)
        similarity = calculate_similarity(value1, value2, is_boolean)
        results[metric] = {
            "Your text": value1,
            "GPT Recreation": value2,
            "Similarity (%)": similarity
        }

    return results

def calculate_similarity(value1, value2, is_boolean=False):
    if is_boolean:
        return 100.0 if value1 == value2 else 0.0
    else:
        # For numerical values, a simple approach is to use the inverse of the relative difference
        return 100.0 * (1 - abs(value1 - value2) / max(abs(value1), abs(value2), 1))
