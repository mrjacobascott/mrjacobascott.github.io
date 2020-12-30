"""  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
Code authored for
CS7646: ML4Trading
By: Jacob Scott
Assignment: Assess_Learners
"""  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
import numpy as np
  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
class DTLearner(object):  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			

    def __init__(self, leaf_size = 1, verbose = False):  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        #initalize all the values in self
        self.leaf_size = leaf_size
        self.verbose = verbose
        self.DTTree = np.array([])
        pass 
    
    def get_best_feature (self, dataX, dataY):
        #return which feature XI is the most correlated with Y
        size = np.size(dataX, axis=1)
        i=0
        feature = 0
        currentHighest = 0
##        print("feature data to correlate X:", dataX)
##        print("feature data to correlate Y:", dataY)
        while i < size:
          # print("X ", np.shape(dataX[:,i]))
          # print("y ", np.shape(dataY))
            correlationArray = np.corrcoef(dataX[:,i], dataY)
            #print("correlation", correlationArray)
            #checking if correlation of featureI is higher than previous highest. If so, stores, else, skips
            if abs(correlationArray[0,1]) > currentHighest:
                currentHighest = abs(correlationArray[0,1])
                feature = i
            i+=1
        #print("best feature=", feature)
        return feature

    def build_tree(self, dataX, dataY):
    
        """
        where I attempt to build the tree
        """
        
        #print("loop")
        #checking if dataX identified is less than the leaf size, if so, create a leaf
        if dataX.shape[0] <= self.leaf_size:
            if self.verbose: print("dataX shape less than leaf size")
            return np.array([[-1, dataY.mean(), -1, -1]])
        #checking if all the Y's are the same value. If so, create a leaf
        elif (np.count_nonzero(dataY == dataY[0]) == len(dataY)) and (dataX.shape[0] > self.leaf_size):
            if self.verbose: print("all y's are the same")
            return np.array([[-1, dataY[0], -1, -1]]) #all y's the same means leaf
        #start building the tree
        else:            
            #determine the best feature to split the data on
            i = int(self.get_best_feature(dataX,dataY))
            if self.verbose: print("here is best feature:", i)
            #determine the median value to split the best feature by
            SplitVal = np.median(dataX[:,i])
            if self.verbose: print("median=", SplitVal)

            #checking if remaining data is less than leaf size while in recursion
            lefts = dataX[:,i]<=SplitVal
            if np.count_nonzero(lefts==False)==len(lefts) or (np.count_nonzero(lefts==True)==len(lefts)):
                #print("it's getting stuck here")
                return np.array([[-1, dataY.mean(), -1, -1]])

            #start building out the left branches/edges
            lefttree = self.build_tree(dataX[dataX[:,i] <= SplitVal],dataY[dataX[:,i] <= SplitVal])
            #left edges complete, start building the rights
            righttree = self.build_tree(dataX[dataX[:,i] > SplitVal],dataY[dataX[:,i] > SplitVal])
            #create the root node
            root = np.array([[int(i),SplitVal,1, lefttree.shape[0] + 1]])
            #print("root", root)
            branches = np.append(root,lefttree, axis = 0)
            #print("temp", branches)
            return  np.append(branches, righttree, axis = 0)
	 			     			  	  		 	  	 		 			  		  			
  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
    def author(self):  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        return 'jscott310'   		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        
    def addEvidence(self,dataX,dataY):  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        """  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @summary: Add training data to learner  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @param dataX: X values of data to add  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @param dataY: the Y training values  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        """  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
#        if self.verbose: print("leaf size: ", self.leaf_size)

        # build and save the model
        self.DTTree = self.build_tree(dataX,dataY)
        #print(self.__dict__)
 
    def query(self,testX):  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        """  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @summary: Estimate a set of test points given the model we built.  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @param points: should be a numpy array with each row corresponding to a specific query.  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        @returns the estimated values according to the saved model.  		  	   		     			  		 			     			  	  		 	  	 		 			  		  			
        """
        #initalize array
        testY = np.array([])
        #creates for each loop to test each test row
        for test in testX:
            loop = True
            node = 0
            while loop:
                #finds the feature/decision column for node
                feature = int(self.DTTree[node][0])
                #print(feature)
                #finds the splitvalue for above feature
                SplitVal = self.DTTree[node][1]
                #if feature == -1, then a leaf was found
                if feature == -1:
                    loop = False
                    #add result to answer array
                    testY = np.append(testY, SplitVal)
                else:
                    #if test value less than or equal to split value, go to left node
                    if test[feature] <= SplitVal:
                        node = int(node + self.DTTree[node][2])
                    #test value not less than or equal to split value, go to right node
                    else:
                        node = int(node + self.DTTree[node][3])

        #print("output:", testY)
        return testY

if __name__=="__main__":
    print("meh")
