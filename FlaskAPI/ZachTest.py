import string
import re
import nltk
from nltk.corpus import stopwords
from textblob import TextBlob
import math
from wordfreq import word_frequency, zipf_frequency, tokenize

#look at trends across paragraphs. Patterns in the statistics. Less complicated -> complicated -> less complicated. This is a pattern for writing style
#distinct words attached to people. "favorite words". often uncommonly used words, or used in strange/irregular positions
#punctuation: comma breaks, semi colons, colon lists, oxford comma, hyphens, exclamations.
# Starting sentence with same words?
#graphing trends across paragraphs, and across writings! showing trends and using them to compare
#first few writings for a class done in class under supervision

#Title: The Enduring Legacy of William Shakespeare        I hate william shakespeare I hate him I hate him I hate him and I hope he dies. Kill shakespeare kill him kill him bad. murder him. he sucks and is bad.

#1 min 20 sec for this (with spellcheck):
fullTextInput = """I hate william shakespeare I hate him I hate him I hate him and I hope he dies. Kill shakespeare kill him kill him bad. murder him. he sucks and is bad.

The Enduring Legacy of William Shakespeare

William Shakespeare, often referred to as the "Bard of Avon," is one of the most celebrated playwrights and poets in the history of literature. His enduring legacy continues to captivate audiences worldwide, transcending time and culture. In this essay, we will explore the life and works of William Shakespeare, his contributions to literature, his influence on the English language, and his lasting impact on the world of theater.

Shakespeare's life is shrouded in mystery, with many gaps in historical records, but he is believed to have been born in Stratford-upon-Avon, England, in 1564. He achieved prominence as an actor and playwright in London during the late 16th and early 17th centuries. His works span a wide range of genres, from tragedy and comedy to history and romance, and he produced timeless masterpieces like "Hamlet," "Romeo and Juliet," and "Macbeth."

One of Shakespeare's most significant contributions to literature is his profound insight into the human condition. His characters are complex and multifaceted, reflecting the intricacies of human emotions, motivations, and relationships. His exploration of universal themes such as love, power, ambition, and betrayal continues to resonate with readers and audiences of all backgrounds. His ability to delve into the human psyche remains unparalleled, making his works a perennial source of introspection and enlightenment.

Shakespeare's influence on the English language is immeasurable. He is credited with coining and popularizing countless words and phrases, many of which are still in use today. Expressions like "break the ice," "wild-goose chase," and "brevity is the soul of wit" originated from his works. His linguistic contributions have left an indelible mark on the evolution of the English language, enriching its vocabulary and providing a lasting source of linguistic creativity.

In addition to his literary and linguistic contributions, Shakespeare's impact on the world of theater is immeasurable. His plays continue to be performed and adapted worldwide, and his theatrical innovations, such as the development of the iambic pentameter and the use of soliloquies, have set enduring standards for dramatic storytelling. The Globe Theatre, where many of his plays were first performed, remains an iconic symbol of the Elizabethan era's theatrical heritage, and it continues to attract theater enthusiasts and scholars from all corners of the globe.

In conclusion, William Shakespeare's legacy is a testament to the enduring power of literature, language, and the performing arts. His works continue to enthrall and inspire, transcending time and cultural boundaries. His profound understanding of the human experience, his contributions to the English language, and his lasting impact on the theater make him an icon in the world of literature and an enduring source of fascination and admiration for generations to come. William Shakespeare's name will forever be synonymous with the pinnacle of literary achievement and the timeless exploration of the human soul.

"""



#**** remember that the main use of this is to compare a " maybe human written" essay to a chat gpt essay off a similar prompt. THIS MEANS THAT MANY OF THE FACTORS THAT CAN CAUSE ISSUES WILL BE THE SAME. If one analysis is off by 10, then the other will be off by roughly 10 as well. This is veeery good...

#the only reason to have paragraphs and sentences separate, is to find insights between them. So like, a writer's changes between sentence attributes might e semi consistent over an essay or between paragraphs
#try that later...but only for attributes whos repetition is meaningful or consistent as opposed to coincidental







class FullText:

    def __init__(self,text): #punctuation: comma breaks, semi colons, colon lists, oxford comma, hyphens, exclamations.

        self.fullTextString = "uninitializedFull"
        self.wordCount = -1
        self.paragraphList = []

        self.formalityScore = -1 #  This test gives the average word length (the size of words used).
        self.verbosityScore = -1 #  This test gives the average sentence length (the size of sentences used).
        self.toneScore = -1 #  This test gives the overall tone of the text. It ranges from negative - positive (-1.0 - 1.0). A tone of 0 is neutral.

        self.oxfordComma = False # This test checks if the text uses an oxford comma.
        self.oxfordCommaContradiction = False #This test checks if the text uses oxford comma, but also doesn't use it sometimes.
        self.commaFreak = -1   #This test gives the comma to sentence ratio of the text (how many commas per sentence on average). 0.5 is a comma every other sentence.
        self.semiColon = False #This test checks if the text uses semi-colons.
        self.hyphen = False #This test checks if the text uses hyphens.
        self.exclamationMark = False #This test checks if the text uses exclamation marks.
        self.questionMark = False #This test checks if the text uses question marks.
        self.spellingErrors = 0  #number of spelling errors

        self.highToneFlag = False #This test checks for tone over 0.3. If true, it means there is a significant positive tone.
        self.lowToneFlag = False #This test checks for tone under -0.3. If true, it means there is a significant negative tone

        self.rareWordList = []   #a list of all "rare" words within the text

        self.fullTextString = text
        self.wordCount = len(self.fullTextString.split()) #full word count

        paragraph_pattern = r'\n\s*\n' #regex to search for 2 end lines in a row
        paragraphTextList = re.split(paragraph_pattern, self.fullTextString)   #splits fulltext into list of paragraphs

        for paraText in paragraphTextList: #loops thru paragraphs
            paraObj_i = Paragraph(paraText) #starts init for paragraph
            self.paragraphList.append(paraObj_i) #adds new paragraph obj to paragraphList

        self.oxfordCommaCheck()
        self.commaFreakCheck()
        self.hyphenCheck()
        self.exclamationMarkCheck()
        self.questionMarkCheck()
        #self.spellingCheck()
        self.VFT()
        self.rareWordCheck()

    def oxfordCommaCheck(self):
        pattern = r',\s+and\s+|,\s+or\s+'  # regex pattern for oxford comma
        noxfordcomma = False  # oxford comma could have been used but wasn't

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
        
    def spellingCheck(self):
        textBlob = TextBlob(self.fullTextString)

        correctedText= str( textBlob.correct() )
        original_words = self.fullTextString.split()
        corrected_words = correctedText.split()
        #print(correctedText)
       # print(corrected_words)

        error_count = sum(1 for original, corrected in zip(original_words, corrected_words) if original != corrected) #bad gpt code stupid stupid

        self.spellingErrors = error_count

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

    def rareWordCheck(self):
        wordList = tokenize(self.fullTextString, 'en')
        uniqueWords = set(wordList)
        for word in uniqueWords:
            wordFreq = word_frequency(word, 'en', wordlist='best', minimum=0.0)
            if wordFreq < 0.00001:
                self.rareWordList.append(word)


class Paragraph:

    def calculateVerbosity(self):  # average sentence lengths
        self.verbosityScore = self.paraWordCount / len(self.sentenceList)



    def calculateFormality(self):  # look for word lengths in the paragraph.... average what the sentences find for verbosity
        count = len(self.sentenceList)
        total = 0
        for sentence in self.sentenceList:
            total = total + sentence.formalityScore

        self.formalityScore = total/count  #this is bad averaging..."some" (lol) accuracy is lost...I can do it manually here pretty easily though....let me cook



    def calculateTone(self):  # use both nltk VADER and textblob and average (or at least consider both) leaning towards textblob
        textblob = TextBlob(self.paragraphText)
        textblob.sentiment
        #self.subjectivityScore = textblob.sentiment.subjectivity
        self.toneScore = textblob.sentiment.polarity





    def __init__(self, text):
        self.paragraphText = "uninitializedPara"
        self.paraWordCount = -1
        self.sentenceList = []
        #self.subjectivityScore = 9999999 # 0.0 (objective, truth statements) - 1.0 (subjective, opinion statements)

        self.formalityScore = -1 #average word length stuff (or percent of long words present)
        self.verbosityScore = -1 #average sentence length stuff
        self.toneScore = 9999999 #tone negative - positive -1.0 - 1.0

        self.paragraphText = text
        self.paraWordCount = len(self.paragraphText.split()) # para word count

        sentence_pattern = r'(?<=[.!?])\s+'  # regex to search ./?.!
        sentenceTextList = re.split(sentence_pattern, self.paragraphText)  # splits paragraph into list of sentences

        for sentenceText in sentenceTextList:  # loops thru sentences
            sentenceObj_i = Sentence(sentenceText)  # starts init for sentence
            self.sentenceList.append(sentenceObj_i)  # adds new sentence obj to sentenceList

        self.calculateVerbosity()
        self.calculateFormality()
        self.calculateTone()








class Sentence:

    def __init__(self,text):
        self.sentenceText = "uninitializedSente"
        self.sentenceWordCount = -1

        self.formalityScore = -1 #average word length

        self.sentenceText = text
        self.sentenceWordCount = len(self.sentenceText.split())
        self.calculateFormality()

    def calculateFormality(self): #takes average word length after tokenizing to removing stopwords (a, the, is, in...words that don't add much meaning or personality)

        # Tokenize the text
        tokenizedText = nltk.word_tokenize(self.sentenceText)

        # Remove stop words
        filteredSentence = [word for word in tokenizedText if word.lower() not in stopwords.words('english')] #remove punctuation probably...

        # Join the filtered words back into a sentence (didn't end up using, but it could be nice later... )
        # filtered_text = ' '.join(filteredSentence)

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
    print(FullText.spellingErrors)             #not currently used until we have a better way to do this
    print(FullText.commaFreak)  #0 to infinity  how many commas did you use per sentence on average
    #compare similarity to rareword lists


testFullText = FullText(fullTextInput)

displayResults(testFullText)
#print(testFullText.wordCount ) #word count of fulltext
#print(testFullText.paragraphList[2].paraWordCount) #word count of 3rd paragraph
#print(testFullText.paragraphList[0].sentenceList[1].sentenceText) #paragraph 2's second sentence

