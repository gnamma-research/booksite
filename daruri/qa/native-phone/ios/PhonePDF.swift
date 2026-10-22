import UIKit
import PDFKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey:Any]? = nil) -> Bool {
        let win=UIWindow(frame: UIScreen.main.bounds)
        win.rootViewController = PhonePDFController()
        win.makeKeyAndVisible()
        self.window=win
        return true
    }
}
final class PhonePDFController: UIViewController {
    private let viewer=PDFView()
    private let heading=UILabel()
    private var pdf:PDFDocument?
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        heading.translatesAutoresizingMaskIntoConstraints = false
        heading.font = .systemFont(ofSize: 13, weight: .medium)
        heading.textColor = .darkGray
        heading.text = "Darūrī · Native iPhone PDFKit"
        heading.textAlignment = .center
        heading.numberOfLines=2
        viewer.translatesAutoresizingMaskIntoConstraints = false
        viewer.backgroundColor = UIColor(white:0.94,alpha:1)
        viewer.autoScales = true
        viewer.displayMode = .singlePage
        viewer.displaysPageBreaks = false
        view.addSubview(heading); view.addSubview(viewer)
        NSLayoutConstraint.activate([
          heading.topAnchor.constraint(equalTo:view.safeAreaLayoutGuide.topAnchor,constant:5),
          heading.leadingAnchor.constraint(equalTo:view.leadingAnchor,constant:8),
          heading.trailingAnchor.constraint(equalTo:view.trailingAnchor,constant:-8),
          heading.heightAnchor.constraint(equalToConstant:42),
          viewer.topAnchor.constraint(equalTo:heading.bottomAnchor,constant:4),
          viewer.leadingAnchor.constraint(equalTo:view.leadingAnchor),
          viewer.trailingAnchor.constraint(equalTo:view.trailingAnchor),
          viewer.bottomAnchor.constraint(equalTo:view.safeAreaLayoutGuide.bottomAnchor)
        ])
        guard let url=Bundle.main.url(forResource:"personal-pdf-sample",withExtension:"pdf"),
              let document=PDFDocument(url:url) else {
          finish(["ok":false,"error":"Native PDFKit could not open fixture"])
          return
        }
        self.pdf=document
        viewer.document=document
        viewer.go(to:document.page(at:7)!)
        DispatchQueue.main.asyncAfter(deadline:.now()+1.5){[weak self] in self?.verify() }
    }
    private func finish(_ record:[String:Any]) {
        do {
          let bytes=try JSONSerialization.data(withJSONObject:record,options:[.prettyPrinted,.sortedKeys])
          let url=FileManager.default.urls(for:.documentDirectory,in:.userDomainMask)[0].appendingPathComponent("phone-result.json")
          try bytes.write(to:url,options:.atomic)
          NSLog("GNAMMA_PHONE_RESULT %@",String(data:bytes,encoding:.utf8) ?? "")
          heading.text=(record["ok"] as? Bool == true) ? "Native PDFKit: PASS" : "Native PDFKit: FAILED"
          heading.textColor=(record["ok"] as? Bool == true) ? .systemGreen : .systemRed
        } catch { NSLog("GNAMMA_PHONE_WRITE_FAILED %@",error.localizedDescription) }
    }
    private func verify() {
        guard let doc=pdf else {finish(["ok":false,"error":"No PDFDocument"]);return}
        let basePages=243
        var errors:[String]=[]
        if doc.pageCount<=basePages {errors.append("No appended notes page")}
        let searchEnglish=doc.findString("SearchableTermGamma",withOptions:[]).count
        let searchFrench=doc.findString("Des idées françaises",withOptions:[]).count
        let searchArabic=doc.findString("مقدمة",withOptions:[]).count
        let searchArabicMixed=doc.findString("التحليل",withOptions:[]).count
        let searchVowelled1=doc.findString("بِسْمِ",withOptions:[]).count
        let searchVowelled2=doc.findString("الرَّحْمَٰنِ",withOptions:[]).count
        let searchP=doc.findString("P1",withOptions:[]).count
        if searchEnglish==0{errors.append("English appendix not searchable")}
        if searchFrench==0{errors.append("Accented French appendix not searchable")}
        if searchArabic==0{errors.append("Arabic appendix not searchable")}
        if searchArabicMixed==0{errors.append("Mixed Arabic/English note word not searchable")}
        if searchVowelled1==0 || searchVowelled2==0{errors.append("Arabic vowelled words not searchable in PDFKit")}
        if searchP==0{errors.append("Personal P1 reference not searchable")}
        struct Link { let page:Int;let target:PDFDestination }
        func targets(_ pg:PDFPage?) -> [Link] {
          guard let pg=pg else{return []}
          var results:[Link]=[]
          for a in pg.annotations {
            guard a.type=="Link" else {continue}
            if let d=a.destination ?? (a.action as? PDFActionGoTo)?.destination,
               let p=d.page {
                let number=doc.index(for:p)
                results.append(Link(page:number,target:d))
            }
          }
          return results
        }
        let forward=targets(doc.page(at:7)).filter{$0.page>=basePages&&$0.page<doc.pageCount}
        let backward=targets(doc.page(at:basePages)).filter{$0.page>=0&&$0.page<basePages}
        if forward.count<4{errors.append("PDFKit exposed only \(forward.count) P/phrase links to endnotes")}
        if backward.count<2{errors.append("PDFKit exposed only \(backward.count) return links")}
        // Native PDFView follows PDFActionGoTo /FitH destinations.
        var forwardArrival = -1, backArrival = -1
        if let link=forward.first {
          viewer.go(to:link.target)
          forwardArrival=doc.index(for:viewer.currentPage ?? doc.page(at:0)!)
          if forwardArrival != link.page {errors.append("PDFView P→endnote navigation did not reach target")}
        }
        if let link=backward.first {
          viewer.go(to:link.target)
          backArrival=doc.index(for:viewer.currentPage ?? doc.page(at:0)!)
          if backArrival != link.page || backArrival != 7 {errors.append("PDFView endnote→source return missed exact §1 source page")}
        }
        // Leave the initial reading page displayed for the device screenshot.
        if let first=doc.page(at:7){viewer.go(to:first)}
        let record:[String:Any]=[
          "ok":errors.isEmpty,"platform":"iOS Simulator / native PDFKit",
          "model":UIDevice.current.model,"system":UIDevice.current.systemVersion,
          "pages":doc.pageCount,"sourcePages":basePages,
          "forwardLinks":forward.count,"backLinks":backward.count,
          "searchEnglish":searchEnglish,"searchFrench":searchFrench,
          "searchArabic":searchArabic,"searchArabicMixed":searchArabicMixed,
          "searchVowelled1":searchVowelled1,"searchVowelled2":searchVowelled2,"searchP":searchP,
          "forwardArrival":forwardArrival,"backArrival":backArrival,
          "errors":errors
        ]
        finish(record)
    }
}
