#include <stdio.h>

void  input(int arr[],int size);
void selection(int arr[],int size);
void display(int arr[],int size);
void  input(int arr[],int size)
{
	printf("ENTER THE ELEMENTS OF THE ARRAY");
	for(int i=0;i<size;i++)
	{
		scanf("%d",&arr[i]);
	}
}
void selection(int arr[],int size)
{
	int minIndex,temp;
	for(int i=0;i<size-1;i++)
	   {
	   	minIndex = i;
	     for(int j=i+1;j<size;j++ )	
	     {
	     	if(arr[j]<arr[minIndex])
	     	{
	     	  minIndex =j;	
			}
		 }
		 temp = arr[i];
		 arr[i] =arr[minIndex];
		 arr[minIndex] = temp;
       }
}
 void display(int arr[],int size)
 {
 	printf("THE SORTED ARRAY IS \n");
 	for(int i=0;i<size;i++)
 	{
 		printf("%d ",arr[i]);
	 }
 }

int main()
{

	int size;
	printf("ENTER THE SIZE OF THE ARRAY \n");
	scanf("%d",&size);
	int arr[size];
	input(arr,size);
	selection(arr,size);
	display(arr,size);
	return 0;
}
 
 
 
 