
import re
import nltk
from nltk.corpus import stopwords
from textblob import TextBlob
import numpy as np
from numpy.linalg import norm


# Ensure nltk dependencies are downloaded
nltk.download('punkt')
nltk.download('stopwords')



class FullText:

    def __init__(self,text):
        self.fullTextString = "uninitializedFull"
        self.wordCount = -1
        self.paragraphList = []

        self.formalityScore = -1
        self.verbosityScore = -1
        self.toneScore = -1

        self.oxfordComma = False
        self.oxfordCommaContradiction = False
        self.commaFreak = -1
        self.semiColon = False
        self.hyphen = False
        self.exclamationMark = False
        self.questionMark = False
        self.spellingErrors = 0

        self.highToneFlag = False
        self.lowToneFlag = False

        self.rareWordList = []

        self.identityVector = []

        self.fullTextString = text
        self.wordCount = len(self.fullTextString.split())

        paragraph_pattern = r'\n\s*\n'
        paragraphTextList = re.split(paragraph_pattern, self.fullTextString)

        for paraText in paragraphTextList:
            paraObj_i = Paragraph(paraText)
            self.paragraphList.append(paraObj_i)

        self.oxfordCommaCheck()
        self.commaFreakCheck()
        self.hyphenCheck()
        self.exclamationMarkCheck()
        self.questionMarkCheck()
        self.VFT()
        self.createIdentityVector()


    def oxfordCommaCheck(self):
        pattern = r',\s+and\s+|,\s+or\s+'
        noxfordcomma = False

        for paragraph in self.paragraphList:
            if re.search(pattern, paragraph.paragraphText):
                self.oxfordComma = True

        pattern = r'[^,]\s+and\s+|[^,]\s+or\s+'
        for paragraph in self.paragraphList:
            if re.search(pattern, paragraph.paragraphText):
                noxfordcomma = True

        if noxfordcomma == True and noxfordcomma == True:
            self.oxfordCommaContradiction = True


    def commaFreakCheck(self):
        sentenceCount = 0
        commaCount = 0

        for paragraph in self.paragraphList:
            for sentence in paragraph.sentenceList:
                sentenceCount = sentenceCount + 1

        for char in self.fullTextString:
            if char == ',':
                commaCount += 1

        self.commaFreak = commaCount / sentenceCount

    def hyphenCheck(self):
        for char in self.fullTextString:
            if char == '-':
                self.hyphen = True

    def exclamationMarkCheck(self):
        for char in self.fullTextString:
            if char == '!':
                self.exclamationMark = True

    def questionMarkCheck(self):
        for char in self.fullTextString:
            if char == '?':
                self.questionMark = True


    def VFT(self):  #Verbosity, Formality, Tone
        Vsum = 0
        Fsum = 0
        Tsum = 0
        for paragraph in self.paragraphList:
            Vsum = Vsum + paragraph.verbosityScore
            Fsum = Fsum + paragraph.formalityScore
            Tsum = Tsum + paragraph.toneScore
            if paragraph.toneScore > 0.3:
                self.highToneFlag = True
            if paragraph.toneScore < -0.3:
                self.lowToneFlag = True


        ParagraphSum = len(self.paragraphList)

        self.toneScore = Tsum / ParagraphSum
        self.verbosityScore = Vsum / ParagraphSum
        self.formalityScore = Fsum / ParagraphSum


    def createIdentityVector(self):

        # if the weights are the same, all attributes contribute equally to identity....... change the values below to make stuff matter more/less
        # weights are currently chosen based on logic (baseless vibes lmao)
        toneWeight = 2
        highToneWeight = 3
        lowToneWeight = 3
        formalityWeight = 5
        verbosityWeight = 5 # bigger because of predefined cap and importance
        oxfordCommaWeight = 1.5
        oxfordContradictionWeight = 1.5
        questionMarkWeight = 1.5
        exclamationMarkWeight = 1.5
        hyphenWeight = 1.5
        commaFreakWeight = 2.5

        attributesToAppend = [
        ( ( (self.toneScore + 1) / 2) * toneWeight ),           #-1 to 1....normalized to 0 to 1
        ( self.highToneFlag * highToneWeight),                     #0 or 1
        ( self.lowToneFlag * lowToneWeight),                       #0 or 1
        ( ( self.formalityScore / 45) * formalityWeight),       #0 to infinity...letter per word average...longest word is 45 so max is 45...normalized to 0 to 1
        ( ( self.verbosityScore / 100) * verbosityWeight ) ,      #0 to infinity...average word count per sentence...no real limit, but use 100...normalized to 0 to 1
        ( self.oxfordComma * oxfordCommaWeight ) ,                      #0 or 1
        ( self.oxfordCommaContradiction * oxfordContradictionWeight) ,            #0 or 1
        ( self.questionMark * questionMarkWeight) ,               # 0 or 1
        ( self.exclamationMark * exclamationMarkWeight) ,            #0 or 1
        (self.hyphen * hyphenWeight ),                #0 or 1
        #self.spellingErrors,
        ( (self.commaFreak / 30) * commaFreakWeight )               #0 to infinity...average commas per sentence...no real limit, but use 30...normalized to 0 to 1
        ]
            #note: all those handwavy predefined caps/upper bounds means that if something was submitted above the upper bound, youd get some waaaaacky results...its a school project afterall



        for attribute in attributesToAppend:    #sorta redundant ik...meh \_(._.)_/
            self.identityVector.append(attribute)





class Paragraph:

    def calculateVerbosity(self):  # average sentence lengths
        self.verbosityScore = self.paraWordCount / len(self.sentenceList)



    def calculateFormality(self):
        count = len(self.sentenceList)
        total = 0
        for sentence in self.sentenceList:
            total = total + sentence.formalityScore
        self.formalityScore = total/count



    def calculateTone(self):
        textblob = TextBlob(self.paragraphText)
        textblob.sentiment
        self.toneScore = textblob.sentiment.polarity





    def __init__(self, text):
        self.paragraphText = "uninitializedPara"
        self.paraWordCount = -1
        self.sentenceList = []

        self.formalityScore = -1 #average word length stuff (or percent of long words present)
        self.verbosityScore = -1 #average sentence length stuff
        self.toneScore = 9999999 #tone negative - positive -1.0 - 1.0

        self.paragraphText = text
        self.paraWordCount = len(self.paragraphText.split()) # para word count

        sentence_pattern = r'(?<=[.!?])\s+'
        sentenceTextList = re.split(sentence_pattern, self.paragraphText)

        for sentenceText in sentenceTextList:
            sentenceObj_i = Sentence(sentenceText)
            self.sentenceList.append(sentenceObj_i)

        self.calculateVerbosity()
        self.calculateFormality()
        self.calculateTone()








class Sentence:

    def __init__(self,text):
        self.sentenceText = "uninitializedSente"
        self.sentenceWordCount = -1

        self.formalityScore = -1

        self.sentenceText = text
        self.sentenceWordCount = len(self.sentenceText.split())
        self.calculateFormality()

    def calculateFormality(self): #takes average word length after tokenizing to removing stopwords (a, the, is, in...words that don't add much meaning or personality)

        tokenizedText = nltk.word_tokenize(self.sentenceText)

        filteredSentence = [word for word in tokenizedText if word.lower() not in stopwords.words('english')] #remove punctuation probably...

        letter_counts = [len(word) for word in filteredSentence]

        self.formalityScore = sum(letter_counts) / ( len(filteredSentence) + 0.0000000001)


def displayResults(FullText):

    print(FullText.toneScore) # -1 to 1
    print(FullText.highToneFlag)  #0 or 1    shows if there was a concentrated area of high tone
    print(FullText.lowToneFlag)   #0 or 1    shows if there was a concentrated area of low tone
    print(FullText.formalityScore) #0-infinity(ish)   average letter count per word
    print(FullText.verbosityScore) #0-infinity   average word count per sentence
    print(FullText.oxfordComma)   #0 or 1       did you use oxford comma
    print(FullText.oxfordCommaContradiction) #0 or 1       could you have used oxford comma but didn't
    print(FullText.questionMark) #0 or 1  did you use question mark
    print(FullText.exclamationMark) #0 or 1 did you use exclamation
    print(FullText.hyphen)     #0 or 1  did you use hyphens
    print(FullText.commaFreak)  #0 to infinity  how many commas did you use per sentence on average

def compare_texts(analysis1, analysis2):
    metrics = {
        "toneScore": False,
        "oxfordComma": True,
        "commaFreak": False,
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

    final_score = compareResults(analysis1, analysis2)
    results['cosineSimilarity'] = final_score

    return results


def calculate_similarity(value1, value2, is_boolean=False):
    if is_boolean:
        return 100.0 if value1 == value2 else 0.0
    else:
        # For numerical values, a simple approach is to use the inverse of the relative difference
        return 100.0 * (1 - abs(value1 - value2) / max(abs(value1), abs(value2), 1))

def compareResults(FullTextA, FullTextB):
    A = np.array ( FullTextA.identityVector )
    B = np.array ( FullTextB.identityVector )

    cosineSimilarity = np.dot(A, B) / (norm(A) * norm(B))
    return cosineSimilarity




