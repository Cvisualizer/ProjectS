
int euclid(int a, int b)
{
  
  int temp,z;
  z=a;
  if(a < b){
    temp = a;
    a = b;
    b = temp;
  }
  if(b < 1){
    return -1;
  }

  if((a % b) == 0){
    return b;
  }
  
  return euclid(b, a % b);
}

int main(){
  printf euclid(52,120);
}