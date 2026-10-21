package org.gnamma.pnotetest;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.RectF;
import android.graphics.pdf.PdfRenderer;
import android.graphics.pdf.content.PdfPageGotoLinkContent;
import android.graphics.pdf.content.PdfPageTextContent;
import android.util.Log;
import android.view.MotionEvent;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.*;
import java.util.*;
import java.text.Normalizer;

public class PhonePdfActivity extends Activity {
    private static final String TAG="GnammaPhone";
    private static final int BASE=243, SOURCE=7;
    private PdfRenderer renderer;
    private ImageView image;
    private TextView status;
    private final JSONObject report=new JSONObject();
    private final JSONArray errors=new JSONArray();
    private List<PdfPageGotoLinkContent> activeLinks=new ArrayList<>();
    private int current=SOURCE, forwardCount=0, returnCount=0;
    private boolean pTapped=false, backTapped=false;
    private int firstNotePage=-1;
    private static final float SCALE=2f;
    private void put(String key,Object value){try{report.put(key,value);}catch(Exception ignored){}}
    private void error(String s){errors.put(s);Log.e(TAG,"GNAMMA_ERROR "+s);}
    private void writeReport(){
        put("platform","Android emulator / native PdfRenderer");
        put("api",Build.VERSION.SDK_INT);
        put("forwardCount",forwardCount);
        put("returnCount",returnCount);
        put("firstNotePage",firstNotePage);
        put("pTapped",pTapped);
        put("backTapped",backTapped);
        put("errors",errors);
        put("ok",errors.length()==0 && pTapped && backTapped);
        try{
          File file=new File(getFilesDir(),"phone-result.json");
          FileOutputStream out=new FileOutputStream(file);
          out.write(report.toString(2).getBytes("UTF-8"));out.close();
        }catch(Exception e){Log.e(TAG,"Report error",e);}
        status.setText(errors.length()==0?(backTapped?"Native Android PDF: PASS":"Native PDF viewer · P links"):"Native PDF viewer: FAIL");
    }
    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        LinearLayout layout=new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.WHITE);
        status=new TextView(this);status.setText("Darūrī · Android native PDF");
        status.setTextColor(Color.DKGRAY);status.setTextSize(15f);
        status.setPadding(14,12,14,12);
        layout.addView(status,new LinearLayout.LayoutParams(-1,-2));
        image=new ImageView(this);image.setScaleType(ImageView.ScaleType.FIT_CENTER);
        layout.addView(image,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(layout);
        image.setOnTouchListener((v,e)->{
          if(e.getAction()==MotionEvent.ACTION_UP){
            onPhoneTap(e.getX(),e.getY());return true;
          }
          return true;
        });
        try{
          File fixture=new File(getFilesDir(),"sample.pdf");
          try(InputStream in=getAssets().open("personal-pdf-sample.pdf");
              OutputStream out=new FileOutputStream(fixture)){
            byte[] buf=new byte[16384];int n;
            while((n=in.read(buf))!=-1)out.write(buf,0,n);
          }
          ParcelFileDescriptor fd=ParcelFileDescriptor.open(fixture,ParcelFileDescriptor.MODE_READ_ONLY);
          renderer=new PdfRenderer(fd);
          put("pages",renderer.getPageCount());
          if(renderer.getPageCount()<=BASE)error("The personal endnotes page is missing");
          checkSearch();
          displayPage(SOURCE);
          image.postDelayed(()->announceTap(true),900);
        }catch(Throwable t){
          error("Android native PdfRenderer failed to open PDF: "+t);
          writeReport();
        }
    }
    private String pageText(int which){
      StringBuilder text=new StringBuilder();
      try(PdfRenderer.Page pg=renderer.openPage(which)){
        for(PdfPageTextContent content:pg.getTextContents())text.append(content.getText()).append(" ");
      }catch(Throwable t){error("Android text extraction failed: "+t);}
      return text.toString();
    }
    private void checkSearch(){
      String txt=pageText(BASE);
      boolean en=txt.contains("SearchableTermGamma");
      boolean fr=txt.contains("Des idées françaises");
      String normalized=Normalizer.normalize(txt,Normalizer.Form.NFD)
        .replaceAll("[\\p{M}\\p{Cf}\\s]+","");
      boolean ar=normalized.contains("مقدمة");
      Log.i(TAG,"GNAMMA_ARABIC_DEBUG "+txt.substring(0,Math.min(700,txt.length()))
        .replace("\\n"," "));
      boolean p=txt.contains("P1");
      put("searchEnglish",en);put("searchFrench",fr);put("searchArabic",ar);put("searchP",p);
      if(!en)error("Android native renderer cannot extract English note text");
      if(!fr)error("Android native renderer cannot extract accented French note text");
      if(!ar)error("Android native renderer cannot extract Arabic note text");
      if(!p)error("Android native renderer cannot extract P1 reference text");
    }
    private void displayPage(int index){
      if(index<0||index>=renderer.getPageCount()){error("Bad navigation target "+index);return;}
      current=index;
      try(PdfRenderer.Page page=renderer.openPage(index)){
        activeLinks=new ArrayList<>(page.getGotoLinks());
        if(index==SOURCE||index>=BASE){
          for(PdfPageGotoLinkContent link:activeLinks)
            Log.i(TAG,"GNAMMA_LINK page="+index+" target="+link.getDestination().getPageNumber()+
              " bounds="+link.getBounds());
        }
        int w=page.getWidth(),h=page.getHeight();
        Bitmap bmp=Bitmap.createBitmap(Math.round(w*SCALE),Math.round(h*SCALE),Bitmap.Config.ARGB_8888);
        bmp.eraseColor(Color.WHITE);
        page.render(bmp,null,null,PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
        image.setImageBitmap(bmp);
        Log.i(TAG,"GNAMMA_PAGE "+index+" LINKS "+activeLinks.size());
        if(index==SOURCE){
          forwardCount=0;
          for(PdfPageGotoLinkContent link:activeLinks){
            if(link.getDestination().getPageNumber()>=BASE)forwardCount++;
          }
          if(forwardCount<4)error("Android renderer did not expose four P/quotation links: "+forwardCount);
        }else if(index>=BASE){
          returnCount=0;
          for(PdfPageGotoLinkContent link:activeLinks){
            if(link.getDestination().getPageNumber()<BASE)returnCount++;
          }
          if(returnCount<2)error("Android renderer did not expose two P-note return links: "+returnCount);
        }
      }catch(Throwable t){error("PDF page render/link inspection failed: "+t);}
      writeReport();
    }
    private PdfPageGotoLinkContent choose(boolean forward){
      for(PdfPageGotoLinkContent l:activeLinks){
        final int page=l.getDestination().getPageNumber();
        final boolean isTarget=forward?page>=BASE:page<BASE;
        if(!isTarget)continue;
        if(forward){
          for(RectF rect:l.getBounds())if(rect.left<35)return l; // P label, not quotation
        }else return l;  // explicit endnote return link
      }
      return null;
    }
    private void announceTap(boolean forward){
      PdfPageGotoLinkContent link=choose(forward);
      if(link==null){error("No tappable "+(forward?"P1":"Return to text")+" link");writeReport();return;}
      final RectF r=link.getBounds().get(0);
      float centerX=r.centerX()*SCALE, centerY=r.centerY()*SCALE;
      float[] vals=new float[9];image.getImageMatrix().getValues(vals);
      int[] screen=new int[2];image.getLocationOnScreen(screen);
      float x=centerX*vals[Matrix.MSCALE_X]+vals[Matrix.MTRANS_X]+screen[0];
      float y=centerY*vals[Matrix.MSCALE_Y]+vals[Matrix.MTRANS_Y]+screen[1];
      Log.i(TAG,(forward?"GNAMMA_TAP_P ":"GNAMMA_TAP_BACK ")+Math.round(x)+" "+Math.round(y)+
        " TARGET "+link.getDestination().getPageNumber());
    }
    private void onPhoneTap(float x,float y){
      float[] values=new float[9];
      image.getImageMatrix().getValues(values);
      float pageX=(x-values[Matrix.MTRANS_X])/values[Matrix.MSCALE_X]/SCALE;
      float pageY=(y-values[Matrix.MTRANS_Y])/values[Matrix.MSCALE_Y]/SCALE;
      for(PdfPageGotoLinkContent link:activeLinks){
        for(RectF rect:link.getBounds()){
          // P markers have expanded hit rectangles supplied by the exporter.
          if(rect.contains(pageX,pageY)){
            int destination=link.getDestination().getPageNumber();
            if(current==SOURCE&&destination>=BASE){
              firstNotePage=destination;pTapped=true;
              Log.i(TAG,"GNAMMA_FORWARD_TAPPED "+destination);
              displayPage(destination);
              image.postDelayed(()->announceTap(false),600);
              return;
            }
            if(current>=BASE&&destination<BASE){
              backTapped=true;
              if(destination!=SOURCE)error("Endnote return goes to wrong page "+destination+"; expected "+SOURCE);
              Log.i(TAG,"GNAMMA_BACK_TAPPED "+destination);
              displayPage(destination);writeReport();
              Log.i(TAG,"GNAMMA_ANDROID_PASS "+report.toString());
              return;
            }
          }
        }
      }
      Log.w(TAG,"GNAMMA_TAP_MISS "+pageX+" "+pageY+" on page "+current);
    }
}
