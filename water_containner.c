#include<stdio.h>
 void input(int arr[], int size);
 void operation(int arr[], int size);
 
  void input(int arr[], int size)
 {
 	printf("ENTER THE ELEMENTS \n");
 	for(int i=0;i<size;i++)
 	{
 	  scanf("%d",&arr[i]);
	}
 }
 void operation(int arr[],int size)
 {
 	int area,maxarea=0,height,width;
 	for(int i=0;i<size-1;i++)
 	{ 
 	  for(int j=i+1;j<size;j++)	
 	  {
 	  	width=j-i;
 	  	if(arr[i]<arr[j])
 	  	{
 	  		height =arr[i];
		}
		else
		{
			height = arr[j];
		}
 	     area= width * height;
 	     if(area>maxarea)
 	     {
 	     	maxarea = area;
		  }
	  }
	}
	printf("MAXIMUM WATER IS %d ",maxarea);
 }
 
 
 
 
 int main()
 {
 	int size;
 	printf("ENTER THE SIZE \n");
 	scanf("%d",&size);
 	int arr[size];
 	input(arr,size);
 	operation(arr,size);
 	return 0;
 }
