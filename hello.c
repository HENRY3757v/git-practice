#include<stdio.h>

void input(int arr1[], int arr2[], int s1, int s2);
void operation(int arr1[], int arr2[], int arr3[], int s1, int s2);
void display(int arr3[], int s3);

void input(int arr1[], int arr2[], int s1, int s2)
{
    printf("ENTER THE ELEMENTS OF ARRAY 1\n");

    for(int i = 0; i < s1; i++)
    {
        scanf("%d", &arr1[i]);
    }

    printf("ENTER THE ELEMENTS OF ARRAY 2\n");

    for(int i = 0; i < s2; i++)
    {
        scanf("%d", &arr2[i]);
    }
}

void operation(int arr1[], int arr2[], int arr3[], int s1, int s2)
{
    int s3 = s1 + s2;

    
    for(int i = 0; i < s1; i++)
    {
        arr3[i] = arr1[i];
    }

    
    for(int i = 0; i < s2; i++)
    {
        arr3[s1 + i] = arr2[i];
    }


    int temp;

    for(int i = 0; i < s3 - 1; i++)
    {
        for(int j = 0; j < s3 - i - 1; j++)
        {
            if(arr3[j] > arr3[j + 1])
            {
                temp = arr3[j];
                arr3[j] = arr3[j + 1];
                arr3[j + 1] = temp;
            }
        }
    }
    
    float median;

if(s3 % 2 != 0)
{
    median = arr3[s3 / 2];
}
else
{
    median = (arr3[s3 / 2 - 1] + arr3[s3 / 2]) / 2.0;
}

printf("\nTHE MEDIAN IS: %.2f\n", median);
}

void display(int arr3[], int s3)
{
    printf("THE SORTED ARRAY IS:\n");

    for(int i = 0; i < s3; i++)
    {
        printf("%d ", arr3[i]);
    }
}

int main()
{
    int s1, s2;

    printf("ENTER THE SIZE OF ARRAY 1 AND ARRAY 2\n");
    scanf("%d%d", &s1, &s2);

    int arr1[s1];
    int arr2[s2];
    int arr3[s1 + s2];

    input(arr1, arr2, s1, s2);

    operation(arr1, arr2, arr3, s1, s2);

    display(arr3, s1 + s2);

    return 0;
}