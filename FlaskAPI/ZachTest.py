import string
import re
import nltk
from nltk.corpus import stopwords
from textblob import TextBlob
import math    #ig I didnt use that huh?
from wordfreq import word_frequency, zipf_frequency, tokenize
import numpy as np
from numpy.linalg import norm

#look at trends across paragraphs. Patterns in the statistics. Less complicated -> complicated -> less complicated. This is a pattern for writing style
#distinct words attached to people. "favorite words". often uncommonly used words, or used in strange/irregular positions
#punctuation: comma breaks, semi colons, colon lists, oxford comma, hyphens, exclamations.
# Starting sentence with same words?
#graphing trends across paragraphs, and across writings! showing trends and using them to compare
#first few writings for a class done in class under supervision


fullTextInput = """Phones

Modern humans today are always on their phone. They are always on their phone more than 5 hours a day no stop .All they do is text back and forward and just have group Chats on social media. They even do it while driving. They are some really bad consequences when stuff happens when it comes to a phone. Some certain areas in the United States ban phones from class rooms just because of it.

When people have phones, they know about certain apps that they have .Apps like Facebook Twitter Instagram and Snapchat. So like if a friend moves away and you want to be in contact you can still be in contact by posting videos or text messages. People always have different ways how to communicate with a phone. Phones have changed due to our generation.

Driving is one of the way how to get around. People always be on their phones while doing it. Which can cause serious Problems. That's why there's a thing that's called no texting while driving. That's a really important thing to remember. Some people still do it because they think It's stupid. No matter what they do they still have to obey it because that's the only way how did he save.

Sometimes on the news there is either an accident or a suicide. It might involve someone not looking where they're going or tweet that someone sent. It either injury or death. If a mysterious number says I'm going to kill you and they know where you live but you don't know the person's contact ,It makes you puzzled and make you start to freak out. Which can end up really badly.

Phones are fine to use and it's also the best way to come over help. If you go through a problem and you can't find help you ,always have a phone there with you. Even though phones are used almost every day as long as you're safe it would come into use if you get into trouble. Make sure you do not be like this phone while you're in the middle of driving. The news always updated when people do something stupid around that involves their phones. The safest way is the best way to stay safe.    
"""
#essay 1 is AI
fullTextInput2 = """Driving while on the phone

Driving while being on the phone is very dangerous. No one should be operating a vehicle and using technology. It can ruin your life. People don't think before they do stuff and it doesn't always end good. You might think you can pay attention to the road and drive at the same time, but you never know until its too late. Many wrecks have been caused by people texting and driving. You could look up at the road one second too late and take someone's life.

Most teens are addicted to their phone and right when it buzzes, they grab it and check it. They can't even drive without them. You could swerve while on your phone, stop too late, or never see the person walking. Just like that someone's hurt and its your fault. Driving is a serious thing. You don't have to just worry about your life but the other peoples on the road's life too. Not everyone can see the same thing, so all your attention needs to be on the road.

That's why you shouldn't drive and be on your phone. Its very dangerous and can take someone's life. You never know when that day will be. You can never be certain on what will happen. That's why you should always be safe and not do it. Think before you take someone's life.      
"""
#essay 2 is Human...lol and its pretty bad

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

        self.identityVector = []  #its a list of all properties needed for comparison

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
        #self.spellingCheck()  #too long would need refinement
        self.VFT()
        #self.rareWordCheck() #not worth it for compare to gpt test
        self.createIdentityVector()


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

    def createIdentityVector(self):

        # if the weights are the same, all attributes contribute equally to identity....... change the values below to make stuff matter more/less
        # weights are currently chosen based on logic (baseless vibes lmao)
        toneWeight = 2
        highToneWeight = 3
        lowToneWeight = 3
        formalityWeight = 4
        verbosityWeight = 4 # bigger because of predefined cap and importance
        oxfordCommaWeight = 1
        oxfordContradictionWeight = 1
        questionMarkWeight = 0.5
        exclamationMarkWeight = 0.5
        hyphenWeight = 0.5
        commaFreakWeight = 1.5

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
    #print(FullText.spellingErrors)             #not currently used until we have a better way to do this
    print(FullText.commaFreak)  #0 to infinity  how many commas did you use per sentence on average
    #compare similarity to rareword lists



def compareResults(FullTextA, FullTextB): #needs two fulltext inputs
    A = np.array ( FullTextA.identityVector ) #makes an array using a the identity vector
    B = np.array ( FullTextB.identityVector )

    cosineSimilarity = np.dot(A, B) / (norm(A) * norm(B))
    print("similarity is: ", cosineSimilarity)
    #aight, more testing is required, but similarity scores of 70 maybe 80+% should mean the same person (AI) wrote both essays/texts


testFullText = FullText(fullTextInput)

testFullText2 = FullText(fullTextInput2)

print("results for input 1:")
displayResults(testFullText)
print("")


print("results for input 2:")
displayResults(testFullText2)
print("")


print("similarity score is:")
compareResults(testFullText,testFullText2)
#print(testFullText.wordCount ) #word count of fulltext
#print(testFullText.paragraphList[2].paraWordCount) #word count of 3rd paragraph
#print(testFullText.paragraphList[0].sentenceList[1].sentenceText) #paragraph 2's second sentence

